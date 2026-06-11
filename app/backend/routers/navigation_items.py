import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.navigation_items import Navigation_itemsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/navigation_items", tags=["navigation_items"])


# ---------- Pydantic Schemas ----------
class Navigation_itemsData(BaseModel):
    """Entity data schema (for create/update)"""
    label: str
    path: str
    parent_id: int = None
    sort_order: int
    is_visible: bool = None


class Navigation_itemsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    label: Optional[str] = None
    path: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_visible: Optional[bool] = None


class Navigation_itemsResponse(BaseModel):
    """Entity response schema"""
    id: int
    label: str
    path: str
    parent_id: Optional[int] = None
    sort_order: int
    is_visible: Optional[bool] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Navigation_itemsListResponse(BaseModel):
    """List response schema"""
    items: List[Navigation_itemsResponse]
    total: int
    skip: int
    limit: int


class Navigation_itemsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Navigation_itemsData]


class Navigation_itemsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Navigation_itemsUpdateData


class Navigation_itemsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Navigation_itemsBatchUpdateItem]


class Navigation_itemsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Navigation_itemsListResponse)
async def query_navigation_itemss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query navigation_itemss with filtering, sorting, and pagination"""
    logger.debug(f"Querying navigation_itemss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Navigation_itemsService(db)
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
        logger.debug(f"Found {result['total']} navigation_itemss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying navigation_itemss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Navigation_itemsListResponse)
async def query_navigation_itemss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query navigation_itemss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying navigation_itemss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Navigation_itemsService(db)
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
        logger.debug(f"Found {result['total']} navigation_itemss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying navigation_itemss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Navigation_itemsResponse)
async def get_navigation_items(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single navigation_items by ID"""
    logger.debug(f"Fetching navigation_items with id: {id}, fields={fields}")
    
    service = Navigation_itemsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Navigation_items with id {id} not found")
            raise HTTPException(status_code=404, detail="Navigation_items not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching navigation_items {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Navigation_itemsResponse, status_code=201)
async def create_navigation_items(
    data: Navigation_itemsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new navigation_items"""
    logger.debug(f"Creating new navigation_items with data: {data}")
    
    service = Navigation_itemsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create navigation_items")
        
        logger.info(f"Navigation_items created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating navigation_items: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating navigation_items: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Navigation_itemsResponse], status_code=201)
async def create_navigation_itemss_batch(
    request: Navigation_itemsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple navigation_itemss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} navigation_itemss")
    
    service = Navigation_itemsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} navigation_itemss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Navigation_itemsResponse])
async def update_navigation_itemss_batch(
    request: Navigation_itemsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple navigation_itemss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} navigation_itemss")
    
    service = Navigation_itemsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} navigation_itemss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Navigation_itemsResponse)
async def update_navigation_items(
    id: int,
    data: Navigation_itemsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing navigation_items"""
    logger.debug(f"Updating navigation_items {id} with data: {data}")

    service = Navigation_itemsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Navigation_items with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Navigation_items not found")
        
        logger.info(f"Navigation_items {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating navigation_items {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating navigation_items {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_navigation_itemss_batch(
    request: Navigation_itemsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple navigation_itemss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} navigation_itemss")
    
    service = Navigation_itemsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} navigation_itemss successfully")
        return {"message": f"Successfully deleted {deleted_count} navigation_itemss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_navigation_items(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single navigation_items by ID"""
    logger.debug(f"Deleting navigation_items with id: {id}")
    
    service = Navigation_itemsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Navigation_items with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Navigation_items not found")
        
        logger.info(f"Navigation_items {id} deleted successfully")
        return {"message": "Navigation_items deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting navigation_items {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")