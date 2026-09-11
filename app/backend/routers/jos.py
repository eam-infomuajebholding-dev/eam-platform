import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from dependencies.jos import get_anonymous_session_id, get_optional_current_user
from schemas.auth import UserResponse
from schemas.jos import (
    AdvanceJourneyRequest,
    RevisitJourneyRequest,
    JourneyDefinitionListResponse,
    JourneyDefinitionResponse,
    JourneyEventListResponse,
    JourneyEventResponse,
    JourneyInstanceListResponse,
    JourneyInstanceResponse,
    RecordEventRequest,
    StartJourneyRequest,
)
from services.jos import (
    JosAccessError,
    JourneyNotFoundError,
    JosDuplicateActiveJourneyError,
    JosService,
    JosStateError,
)
from services.jos_validators import JourneyValidationError
from services.service_requests import ServiceRequestService, ServiceRequestValidationError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/jos", tags=["jos"])


def _journey_instance_response(
    instance,
    service_request_id: int | None = None,
) -> JourneyInstanceResponse:
    response = JourneyInstanceResponse.model_validate(instance)
    return response.model_copy(update={"service_request_id": service_request_id})


def _map_jos_error(exc: Exception) -> HTTPException:
    if isinstance(exc, JourneyValidationError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    if isinstance(exc, JosAccessError):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    if isinstance(exc, JourneyNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    if isinstance(exc, JosDuplicateActiveJourneyError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": str(exc),
                "existing_instance_id": exc.existing_instance_id,
            },
        )
    if isinstance(exc, JosStateError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    if isinstance(exc, ServiceRequestValidationError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    logger.exception("Unexpected JOS error")
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/definitions", response_model=JourneyDefinitionListResponse)
async def list_journey_definitions(db: AsyncSession = Depends(get_db)):
    service = JosService(db)
    items = await service.list_definitions()
    return JourneyDefinitionListResponse(items=items)


@router.get("/definitions/{journey_type}", response_model=JourneyDefinitionResponse)
async def get_journey_definition(journey_type: str, db: AsyncSession = Depends(get_db)):
    service = JosService(db)
    definition = await service.get_definition_by_type(journey_type)
    if not definition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey definition not found")
    return definition


@router.post("/instances/start", response_model=JourneyInstanceResponse, status_code=status.HTTP_201_CREATED)
async def start_journey(
    data: StartJourneyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
):
    service = JosService(db)
    try:
        instance = await service.start_journey(
            data.journey_type,
            anonymous_session_id=data.anonymous_session_id,
            user_id=current_user.id if current_user else None,
            initial_context=data.initial_context,
        )
        return instance
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.get("/instances/active", response_model=JourneyInstanceListResponse)
async def list_active_journey_instances(
    journey_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    service = JosService(db)
    try:
        items = await service.list_active_instances(
            journey_type=journey_type,
            user_id=current_user.id if current_user else None,
            anonymous_session_id=anonymous_session_id,
        )
        return JourneyInstanceListResponse(items=items)
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.post("/instances/{instance_id}/attach", response_model=JourneyInstanceResponse)
async def attach_journey_identity(
    instance_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    if not anonymous_session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Anonymous-Session-Id header is required",
        )

    service = JosService(db)
    try:
        instance, service_request_id = await service.attach_identity(
            instance_id,
            user_id=current_user.id,
            anonymous_session_id=anonymous_session_id,
        )
        return _journey_instance_response(instance, service_request_id)
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.get("/instances/{instance_id}", response_model=JourneyInstanceResponse)
async def get_journey_instance(
    instance_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    service = JosService(db)
    try:
        instance = await service.get_owned_instance(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=current_user.id if current_user else None,
        )
        return instance
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.post("/instances/{instance_id}/advance", response_model=JourneyInstanceResponse)
async def advance_journey(
    instance_id: int,
    data: AdvanceJourneyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    service = JosService(db)
    try:
        instance = await service.advance(
            instance_id,
            input_data=data.input,
            anonymous_session_id=anonymous_session_id,
            user_id=current_user.id if current_user else None,
        )
        return instance
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.post("/instances/{instance_id}/revisit", response_model=JourneyInstanceResponse)
async def revisit_journey_step(
    instance_id: int,
    data: RevisitJourneyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    service = JosService(db)
    try:
        instance = await service.revisit_step(
            instance_id,
            data.target_step_key,
            anonymous_session_id=anonymous_session_id,
            user_id=current_user.id if current_user else None,
        )
        return instance
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.post("/instances/{instance_id}/pause", response_model=JourneyInstanceResponse)
async def pause_journey(
    instance_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    service = JosService(db)
    try:
        instance = await service.pause(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=current_user.id if current_user else None,
        )
        return instance
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.post("/instances/{instance_id}/resume", response_model=JourneyInstanceResponse)
async def resume_journey(
    instance_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    service = JosService(db)
    try:
        instance = await service.resume(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=current_user.id if current_user else None,
        )
        return instance
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.post("/instances/{instance_id}/complete", response_model=JourneyInstanceResponse)
async def complete_journey(
    instance_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    service = JosService(db)
    try:
        instance, service_request_id = await service.complete(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=current_user.id if current_user else None,
        )
        return _journey_instance_response(instance, service_request_id)
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.post("/instances/{instance_id}/events", response_model=JourneyEventResponse, status_code=status.HTTP_201_CREATED)
async def record_journey_event(
    instance_id: int,
    data: RecordEventRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    service = JosService(db)
    try:
        event = await service.record_event(
            instance_id,
            event_type=data.event_type,
            payload=data.payload,
            anonymous_session_id=anonymous_session_id,
            user_id=current_user.id if current_user else None,
        )
        return event
    except Exception as exc:
        raise _map_jos_error(exc) from exc


@router.get("/instances/{instance_id}/events", response_model=JourneyEventListResponse)
async def list_journey_events(
    instance_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    service = JosService(db)
    try:
        await service.get_owned_instance(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=current_user.id if current_user else None,
        )
        items = await service.list_events(instance_id)
        return JourneyEventListResponse(items=items)
    except Exception as exc:
        raise _map_jos_error(exc) from exc
