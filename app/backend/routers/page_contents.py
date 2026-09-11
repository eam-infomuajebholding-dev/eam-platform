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
from services.page_contents import Page_contentsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/page_contents", tags=["page_contents"])


# ---------- Pydantic Schemas ----------
class Page_contentsData(BaseModel):
    """Entity data schema (for create/update)"""
    page_key: str
    section_key: str
    title: str = None
    content: str = None
    sort_order: int = None


class Page_contentsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    page_key: Optional[str] = None
    section_key: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    sort_order: Optional[int] = None


class Page_contentsResponse(BaseModel):
    """Entity response schema"""
    id: int
    page_key: str
    section_key: str
    title: Optional[str] = None
    content: Optional[str] = None
    sort_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Page_contentsListResponse(BaseModel):
    """List response schema"""
    items: List[Page_contentsResponse]
    total: int
    skip: int
    limit: int


class Page_contentsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Page_contentsData]


class Page_contentsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Page_contentsUpdateData


class Page_contentsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Page_contentsBatchUpdateItem]


class Page_contentsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Page_contentsListResponse)
async def query_page_contentss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query page_contentss with filtering, sorting, and pagination"""
    logger.debug(f"Querying page_contentss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Page_contentsService(db)
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
        logger.debug(f"Found {result['total']} page_contentss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying page_contentss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Page_contentsListResponse)
async def query_page_contentss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query page_contentss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying page_contentss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Page_contentsService(db)
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
        logger.debug(f"Found {result['total']} page_contentss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying page_contentss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Page_contentsResponse)
async def get_page_contents(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single page_contents by ID"""
    logger.debug(f"Fetching page_contents with id: {id}, fields={fields}")
    
    service = Page_contentsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Page_contents with id {id} not found")
            raise HTTPException(status_code=404, detail="Page_contents not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching page_contents {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Page_contentsResponse, status_code=201)
async def create_page_contents(
    data: Page_contentsData,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Create a new page_contents"""
    logger.debug(f"Creating new page_contents with data: {data}")
    
    service = Page_contentsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create page_contents")
        
        logger.info(f"Page_contents created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating page_contents: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating page_contents: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Page_contentsResponse], status_code=201)
async def create_page_contentss_batch(
    request: Page_contentsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Create multiple page_contentss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} page_contentss")
    
    service = Page_contentsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} page_contentss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Page_contentsResponse])
async def update_page_contentss_batch(
    request: Page_contentsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Update multiple page_contentss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} page_contentss")
    
    service = Page_contentsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} page_contentss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Page_contentsResponse)
async def update_page_contents(
    id: int,
    data: Page_contentsUpdateData,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Update an existing page_contents"""
    logger.debug(f"Updating page_contents {id} with data: {data}")

    service = Page_contentsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Page_contents with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Page_contents not found")
        
        logger.info(f"Page_contents {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating page_contents {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating page_contents {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_page_contentss_batch(
    request: Page_contentsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Delete multiple page_contentss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} page_contentss")
    
    service = Page_contentsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} page_contentss successfully")
        return {"message": f"Successfully deleted {deleted_count} page_contentss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_page_contents(
    id: int,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Delete a single page_contents by ID"""
    logger.debug(f"Deleting page_contents with id: {id}")
    
    service = Page_contentsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Page_contents with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Page_contents not found")
        
        logger.info(f"Page_contents {id} deleted successfully")
        return {"message": "Page_contents deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting page_contents {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")