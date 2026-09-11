import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from schemas.operations_service_requests import CustomerResponseBody
from schemas.service_requests import (
    ServiceRequestActivityItem,
    ServiceRequestDetail,
    ServiceRequestListResponse,
    summary_from_model,
)
from services.service_requests import (
    SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
    ServiceRequestService,
    ServiceRequestTransitionError,
    ServiceRequestValidationError,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/service-requests", tags=["service-requests"])


def _activity_items(service: ServiceRequestService, rows) -> list[ServiceRequestActivityItem]:
    return [
        ServiceRequestActivityItem(
            id=row.id,
            from_status=row.from_status,
            to_status=row.to_status,
            customer_message=row.customer_message,
            event_label=ServiceRequestService.customer_event_label(row) or None,
            created_at=row.created_at,
        )
        for row in rows
    ]


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
    activity = await service.list_customer_activity(request_id)
    detail = ServiceRequestDetail.model_validate(item)
    return detail.model_copy(
        update={
            "activity": _activity_items(service, activity),
            "pending_customer_action": item.status == SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
        }
    )


@router.post("/{request_id}/customer-response", response_model=ServiceRequestDetail)
async def submit_customer_response(
    request_id: int,
    body: CustomerResponseBody,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
):
    service = ServiceRequestService(db)
    try:
        await service.record_customer_response(
            request_id,
            user_id=current_user.id,
            message=body.message,
        )
        await db.commit()
    except ServiceRequestTransitionError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ServiceRequestValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    item = await service.get_by_id_for_user(request_id, current_user.id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")
    activity = await service.list_customer_activity(request_id)
    detail = ServiceRequestDetail.model_validate(item)
    return detail.model_copy(
        update={
            "activity": _activity_items(service, activity),
            "pending_customer_action": item.status == SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
        }
    )
