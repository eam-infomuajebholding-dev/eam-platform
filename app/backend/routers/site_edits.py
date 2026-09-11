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
from services.site_edits import Site_editsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/site_edits", tags=["site_edits"])


# ---------- Pydantic Schemas ----------
class Site_editsData(BaseModel):
    """Entity data schema (for create/update)"""
    page: str
    element_key: str
    edit_type: str
    value: str


class Site_editsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    page: Optional[str] = None
    element_key: Optional[str] = None
    edit_type: Optional[str] = None
    value: Optional[str] = None


class Site_editsResponse(BaseModel):
    """Entity response schema"""
    id: int
    page: str
    element_key: str
    edit_type: str
    value: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Site_editsListResponse(BaseModel):
    """List response schema"""
    items: List[Site_editsResponse]
    total: int
    skip: int
    limit: int


class Site_editsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Site_editsData]


class Site_editsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Site_editsUpdateData


class Site_editsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Site_editsBatchUpdateItem]


class Site_editsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Site_editsListResponse)
async def query_site_editss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query site_editss with filtering, sorting, and pagination"""
    logger.debug(f"Querying site_editss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Site_editsService(db)
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
        logger.debug(f"Found {result['total']} site_editss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying site_editss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Site_editsListResponse)
async def query_site_editss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query site_editss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying site_editss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Site_editsService(db)
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
        logger.debug(f"Found {result['total']} site_editss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying site_editss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Site_editsResponse)
async def get_site_edits(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single site_edits by ID"""
    logger.debug(f"Fetching site_edits with id: {id}, fields={fields}")
    
    service = Site_editsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Site_edits with id {id} not found")
            raise HTTPException(status_code=404, detail="Site_edits not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching site_edits {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Site_editsResponse, status_code=201)
async def create_site_edits(
    data: Site_editsData,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Create a new site_edits"""
    logger.debug(f"Creating new site_edits with data: {data}")
    
    service = Site_editsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create site_edits")
        
        logger.info(f"Site_edits created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating site_edits: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating site_edits: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Site_editsResponse], status_code=201)
async def create_site_editss_batch(
    request: Site_editsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Create multiple site_editss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} site_editss")
    
    service = Site_editsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} site_editss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Site_editsResponse])
async def update_site_editss_batch(
    request: Site_editsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Update multiple site_editss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} site_editss")
    
    service = Site_editsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} site_editss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Site_editsResponse)
async def update_site_edits(
    id: int,
    data: Site_editsUpdateData,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Update an existing site_edits"""
    logger.debug(f"Updating site_edits {id} with data: {data}")

    service = Site_editsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Site_edits with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Site_edits not found")
        
        logger.info(f"Site_edits {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating site_edits {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating site_edits {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_site_editss_batch(
    request: Site_editsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Delete multiple site_editss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} site_editss")
    
    service = Site_editsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} site_editss successfully")
        return {"message": f"Successfully deleted {deleted_count} site_editss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_site_edits(
    id: int,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(require_cms_admin_write),
):
    """Delete a single site_edits by ID"""
    logger.debug(f"Deleting site_edits with id: {id}")
    
    service = Site_editsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Site_edits with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Site_edits not found")
        
        logger.info(f"Site_edits {id} deleted successfully")
        return {"message": "Site_edits deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting site_edits {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")