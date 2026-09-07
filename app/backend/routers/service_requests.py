import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from schemas.service_requests import (
    ServiceRequestDetail,
    ServiceRequestListResponse,
    summary_from_model,
)
from services.service_requests import ServiceRequestService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/service-requests", tags=["service-requests"])


@router.get("", response_model=ServiceRequestListResponse)
async def list_service_requests(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    service = ServiceRequestService(db)
    items = await service.list_for_user(current_user.id)
    return ServiceRequestListResponse(items=[summary_from_model(item) for item in items])


@router.get("/{request_id}", response_model=ServiceRequestDetail)
async def get_service_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    service = ServiceRequestService(db)
    item = await service.get_by_id_for_user(request_id, current_user.id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")
    return item
