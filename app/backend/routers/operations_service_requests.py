import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from schemas.auth import UserResponse
from schemas.operations_service_requests import (
    InternalNoteBody,
    OperationsServiceRequestDetail,
    OperationsServiceRequestListResponse,
    OperationsServiceRequestSummary,
    QualifyRequestBody,
    RequestInformationBody,
    ServiceRequestTransitionResponse,
    StartReviewRequest,
)
from services.service_requests import (
    SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
    SERVICE_REQUEST_STATUS_QUALIFIED,
    SERVICE_REQUEST_STATUS_SUBMITTED,
    SERVICE_REQUEST_STATUS_UNDER_REVIEW,
    ServiceRequestService,
    ServiceRequestTransitionError,
    ServiceRequestValidationError,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/operations/service-requests", tags=["operations"])


def _map_validation_error(exc: Exception) -> HTTPException:
    if isinstance(exc, ServiceRequestTransitionError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    if isinstance(exc, ServiceRequestValidationError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    logger.exception("Unexpected operations service request error")
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("", response_model=OperationsServiceRequestListResponse)
async def list_operations_service_requests(
    status: str | None = None,
    journey_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = ServiceRequestService(db)
    status_filter: frozenset[str] | None = None
    if status:
        allowed = {
            SERVICE_REQUEST_STATUS_SUBMITTED,
            SERVICE_REQUEST_STATUS_UNDER_REVIEW,
            SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
            SERVICE_REQUEST_STATUS_QUALIFIED,
        }
        if status not in allowed:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status filter")
        status_filter = frozenset({status})
    else:
        status_filter = frozenset(
            {
                SERVICE_REQUEST_STATUS_SUBMITTED,
                SERVICE_REQUEST_STATUS_UNDER_REVIEW,
                SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
                SERVICE_REQUEST_STATUS_QUALIFIED,
            }
        )
    if journey_type and journey_type not in {
        "build_villa",
        "engineering_consulting",
        "contracting",
        "real_estate_valuation",
        "smart_maintenance",
        "project_management",
        "furnishing",
    }:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid journey_type filter")
    items = await service.list_for_operations(statuses=status_filter, journey_type=journey_type)
    return OperationsServiceRequestListResponse(
        items=[OperationsServiceRequestSummary.model_validate(item) for item in items]
    )


@router.get("/{request_id}", response_model=OperationsServiceRequestDetail)
async def get_operations_service_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = ServiceRequestService(db)
    item = await service.get_by_id(request_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")
    transitions = await service.list_transitions(request_id)
    detail = OperationsServiceRequestDetail.model_validate(item)
    return detail.model_copy(
        update={
            "transitions": [ServiceRequestTransitionResponse.model_validate(t) for t in transitions]
        }
    )


@router.post("/{request_id}/start-review", response_model=OperationsServiceRequestDetail)
async def start_professional_review(
    request_id: int,
    body: StartReviewRequest,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    service = ServiceRequestService(db)
    try:
        item = await service.start_professional_review(
            request_id,
            actor_user_id=admin.id,
            internal_note=body.internal_note,
        )
        await db.commit()
        await db.refresh(item)
        transitions = await service.list_transitions(request_id)
        detail = OperationsServiceRequestDetail.model_validate(item)
        return detail.model_copy(
            update={
                "transitions": [ServiceRequestTransitionResponse.model_validate(t) for t in transitions]
            }
        )
    except Exception as exc:
        raise _map_validation_error(exc) from exc


@router.post("/{request_id}/request-information", response_model=OperationsServiceRequestDetail)
async def request_more_information(
    request_id: int,
    body: RequestInformationBody,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    service = ServiceRequestService(db)
    try:
        item = await service.request_information(
            request_id,
            actor_user_id=admin.id,
            customer_message=body.customer_message,
            internal_note=body.internal_note,
        )
        await db.commit()
        await db.refresh(item)
        transitions = await service.list_transitions(request_id)
        detail = OperationsServiceRequestDetail.model_validate(item)
        return detail.model_copy(
            update={
                "transitions": [ServiceRequestTransitionResponse.model_validate(t) for t in transitions]
            }
        )
    except Exception as exc:
        raise _map_validation_error(exc) from exc


@router.post("/{request_id}/internal-note", response_model=OperationsServiceRequestDetail)
async def record_internal_note(
    request_id: int,
    body: InternalNoteBody,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    service = ServiceRequestService(db)
    try:
        await service.record_internal_note(
            request_id,
            actor_user_id=admin.id,
            internal_note=body.internal_note,
        )
        await db.commit()
        item = await service.get_by_id(request_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")
        transitions = await service.list_transitions(request_id)
        detail = OperationsServiceRequestDetail.model_validate(item)
        return detail.model_copy(
            update={
                "transitions": [ServiceRequestTransitionResponse.model_validate(t) for t in transitions]
            }
        )
    except Exception as exc:
        raise _map_validation_error(exc) from exc


@router.post("/{request_id}/qualify", response_model=OperationsServiceRequestDetail)
async def qualify_service_request(
    request_id: int,
    body: QualifyRequestBody,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    service = ServiceRequestService(db)
    try:
        item = await service.mark_qualified(
            request_id,
            actor_user_id=admin.id,
            reason=body.reason,
            internal_note=body.internal_note,
        )
        await db.commit()
        await db.refresh(item)
        transitions = await service.list_transitions(request_id)
        detail = OperationsServiceRequestDetail.model_validate(item)
        return detail.model_copy(
            update={
                "transitions": [ServiceRequestTransitionResponse.model_validate(t) for t in transitions]
            }
        )
    except Exception as exc:
        raise _map_validation_error(exc) from exc
