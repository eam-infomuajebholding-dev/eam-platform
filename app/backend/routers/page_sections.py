import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.cms_write import require_cms_admin_write
from schemas.auth import UserResponse
from services.page_sections import Page_sectionsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/page_sections", tags=["page_sections"])


# ---------- Pydantic Schemas ----------
class Page_sectionsData(BaseModel):
    """Entity data schema (for create/update)"""
    page_name: str
    section_data: str
    sort_order: int = None


class Page_sectionsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    page_name: Optional[str] = None
    section_data: Optional[str] = None
    sort_order: Optional[int] = None


class Page_sectionsResponse(BaseModel):
    """Entity response schema"""
    id: int
    page_name: str
    section_data: str
    sort_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Page_sectionsListResponse(BaseModel):
    """List response schema"""
    items: List[Page_sectionsResponse]
    total: int
    skip: int
    limit: int


class Page_sectionsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Page_sectionsData]


class Page_sectionsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Page_sectionsUpdateData


class Page_sectionsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Page_sectionsBatchUpdateItem]


class Page_sectionsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Page_sectionsListResponse)
async def query_page_sectionss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query page_sectionss with filtering, sorting, and pagination"""
    logger.debug(f"Querying page_sectionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Page_sectionsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} page_sectionss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying page_sectionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Page_sectionsListResponse)
async def query_page_sectionss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query page_sectionss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying page_sectionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Page_sectionsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} page_sectionss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying page_sectionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Page_sectionsResponse)
async def get_page_sections(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single page_sections by ID"""
    logger.debug(f"Fetching page_sections with id: {id}, fields={fields}")
    
    service = Page_sectionsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Page_sections with id {id} not found")
            raise HTTPException(status_code=404, detail="Page_sections not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching page_sections {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Page_sectionsResponse, status_code=201)
async def create_page_sections(
    data: Page_sectionsData,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Create a new page_sections"""
    logger.debug(f"Creating new page_sections with data: {data}")
    
    service = Page_sectionsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create page_sections")
        
        logger.info(f"Page_sections created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating page_sections: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating page_sections: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Page_sectionsResponse], status_code=201)
async def create_page_sectionss_batch(
    request: Page_sectionsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Create multiple page_sectionss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} page_sectionss")
    
    service = Page_sectionsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} page_sectionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Page_sectionsResponse])
async def update_page_sectionss_batch(
    request: Page_sectionsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Update multiple page_sectionss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} page_sectionss")
    
    service = Page_sectionsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} page_sectionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Page_sectionsResponse)
async def update_page_sections(
    id: int,
    data: Page_sectionsUpdateData,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Update an existing page_sections"""
    logger.debug(f"Updating page_sections {id} with data: {data}")

    service = Page_sectionsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Page_sections with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Page_sections not found")
        
        logger.info(f"Page_sections {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating page_sections {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating page_sections {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_page_sectionss_batch(
    request: Page_sectionsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Delete multiple page_sectionss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} page_sectionss")
    
    service = Page_sectionsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} page_sectionss successfully")
        return {"message": f"Successfully deleted {deleted_count} page_sectionss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_page_sections(
    id: int,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Delete a single page_sections by ID"""
    logger.debug(f"Deleting page_sections with id: {id}")
    
    service = Page_sectionsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Page_sections with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Page_sections not found")
        
        logger.info(f"Page_sections {id} deleted successfully")
        return {"message": "Page_sections deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting page_sections {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")