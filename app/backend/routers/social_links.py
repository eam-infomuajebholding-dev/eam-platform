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
from services.social_links import Social_linksService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/social_links", tags=["social_links"])


# ---------- Pydantic Schemas ----------
class Social_linksData(BaseModel):
    """Entity data schema (for create/update)"""
    platform: str
    url: str
    icon: str = None
    sort_order: int = None


class Social_linksUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    platform: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class Social_linksResponse(BaseModel):
    """Entity response schema"""
    id: int
    platform: str
    url: str
    icon: Optional[str] = None
    sort_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Social_linksListResponse(BaseModel):
    """List response schema"""
    items: List[Social_linksResponse]
    total: int
    skip: int
    limit: int


class Social_linksBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Social_linksData]


class Social_linksBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Social_linksUpdateData


class Social_linksBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Social_linksBatchUpdateItem]


class Social_linksBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Social_linksListResponse)
async def query_social_linkss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query social_linkss with filtering, sorting, and pagination"""
    logger.debug(f"Querying social_linkss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Social_linksService(db)
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
        logger.debug(f"Found {result['total']} social_linkss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying social_linkss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Social_linksListResponse)
async def query_social_linkss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query social_linkss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying social_linkss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Social_linksService(db)
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
        logger.debug(f"Found {result['total']} social_linkss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying social_linkss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Social_linksResponse)
async def get_social_links(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single social_links by ID"""
    logger.debug(f"Fetching social_links with id: {id}, fields={fields}")
    
    service = Social_linksService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Social_links with id {id} not found")
            raise HTTPException(status_code=404, detail="Social_links not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching social_links {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Social_linksResponse, status_code=201)
async def create_social_links(
    data: Social_linksData,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Create a new social_links"""
    logger.debug(f"Creating new social_links with data: {data}")
    
    service = Social_linksService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create social_links")
        
        logger.info(f"Social_links created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating social_links: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating social_links: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Social_linksResponse], status_code=201)
async def create_social_linkss_batch(
    request: Social_linksBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Create multiple social_linkss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} social_linkss")
    
    service = Social_linksService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} social_linkss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Social_linksResponse])
async def update_social_linkss_batch(
    request: Social_linksBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Update multiple social_linkss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} social_linkss")
    
    service = Social_linksService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} social_linkss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Social_linksResponse)
async def update_social_links(
    id: int,
    data: Social_linksUpdateData,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Update an existing social_links"""
    logger.debug(f"Updating social_links {id} with data: {data}")

    service = Social_linksService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Social_links with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Social_links not found")
        
        logger.info(f"Social_links {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating social_links {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating social_links {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_social_linkss_batch(
    request: Social_linksBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Delete multiple social_linkss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} social_linkss")
    
    service = Social_linksService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} social_linkss successfully")
        return {"message": f"Successfully deleted {deleted_count} social_linkss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_social_links(
    id: int,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Delete a single social_links by ID"""
    logger.debug(f"Deleting social_links with id: {id}")
    
    service = Social_linksService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Social_links with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Social_links not found")
        
        logger.info(f"Social_links {id} deleted successfully")
        return {"message": "Social_links deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting social_links {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")