import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.site_pages import Site_pagesService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/site_pages", tags=["site_pages"])


# ---------- Pydantic Schemas ----------
class Site_pagesData(BaseModel):
    """Entity data schema (for create/update)"""
    title: str
    path: str
    background_type: str = None
    background_value: str = None


class Site_pagesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    title: Optional[str] = None
    path: Optional[str] = None
    background_type: Optional[str] = None
    background_value: Optional[str] = None


class Site_pagesResponse(BaseModel):
    """Entity response schema"""
    id: int
    title: str
    path: str
    background_type: Optional[str] = None
    background_value: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Site_pagesListResponse(BaseModel):
    """List response schema"""
    items: List[Site_pagesResponse]
    total: int
    skip: int
    limit: int


class Site_pagesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Site_pagesData]


class Site_pagesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Site_pagesUpdateData


class Site_pagesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Site_pagesBatchUpdateItem]


class Site_pagesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Site_pagesListResponse)
async def query_site_pagess(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query site_pagess with filtering, sorting, and pagination"""
    logger.debug(f"Querying site_pagess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Site_pagesService(db)
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
        logger.debug(f"Found {result['total']} site_pagess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying site_pagess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Site_pagesListResponse)
async def query_site_pagess_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query site_pagess with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying site_pagess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Site_pagesService(db)
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
        logger.debug(f"Found {result['total']} site_pagess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying site_pagess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Site_pagesResponse)
async def get_site_pages(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single site_pages by ID"""
    logger.debug(f"Fetching site_pages with id: {id}, fields={fields}")
    
    service = Site_pagesService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Site_pages with id {id} not found")
            raise HTTPException(status_code=404, detail="Site_pages not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching site_pages {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Site_pagesResponse, status_code=201)
async def create_site_pages(
    data: Site_pagesData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new site_pages"""
    logger.debug(f"Creating new site_pages with data: {data}")
    
    service = Site_pagesService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create site_pages")
        
        logger.info(f"Site_pages created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating site_pages: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating site_pages: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Site_pagesResponse], status_code=201)
async def create_site_pagess_batch(
    request: Site_pagesBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple site_pagess in a single request"""
    logger.debug(f"Batch creating {len(request.items)} site_pagess")
    
    service = Site_pagesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} site_pagess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Site_pagesResponse])
async def update_site_pagess_batch(
    request: Site_pagesBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple site_pagess in a single request"""
    logger.debug(f"Batch updating {len(request.items)} site_pagess")
    
    service = Site_pagesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} site_pagess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Site_pagesResponse)
async def update_site_pages(
    id: int,
    data: Site_pagesUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing site_pages"""
    logger.debug(f"Updating site_pages {id} with data: {data}")

    service = Site_pagesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Site_pages with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Site_pages not found")
        
        logger.info(f"Site_pages {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating site_pages {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating site_pages {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_site_pagess_batch(
    request: Site_pagesBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple site_pagess by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} site_pagess")
    
    service = Site_pagesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} site_pagess successfully")
        return {"message": f"Successfully deleted {deleted_count} site_pagess", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_site_pages(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single site_pages by ID"""
    logger.debug(f"Deleting site_pages with id: {id}")
    
    service = Site_pagesService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Site_pages with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Site_pages not found")
        
        logger.info(f"Site_pages {id} deleted successfully")
        return {"message": "Site_pages deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting site_pages {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")