import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from dependencies.partner_auth import PartnerAuthContext, get_partner_session_context
from schemas.auth import UserResponse
from schemas.partner_portal import (
    PartnerMeResponse,
    PartnerRespondBody,
    PartnerServiceRequestDetail,
    PartnerServiceRequestListResponse,
    PartnerServiceRequestSummary,
)
from schemas.logistics import (
    DeliveryShipmentListResponse,
    DeliveryShipmentSummary,
    UpdateDeliveryShipmentStatusBody,
)
from services.logistics import LogisticsError, LogisticsService
from services.partners import PartnerService
from services.partner_portal import PartnerPortalError, PartnerPortalService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/partner", tags=["partner-portal"])


@router.get("/me", response_model=PartnerMeResponse)
async def partner_me(
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(get_partner_session_context),
    current_user: UserResponse = Depends(get_current_user),
):
    portal = PartnerPortalService(db)
    membership = await portal.get_active_membership(current_user.id)
    if membership is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a partner user")
    partners = PartnerService(db)
    org = await partners.get_org_by_id(membership.partner_org_id)
    if org is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner org missing")
    return PartnerMeResponse(
        partner_org_id=org.id,
        partner_slug=org.slug,
        display_name_ar=org.display_name_ar,
        role=membership.role,
    )


@router.get("/service-requests", response_model=PartnerServiceRequestListResponse)
async def list_partner_service_requests(
    assignment_status: str | None = None,
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(get_partner_session_context),
):
    portal = PartnerPortalService(db)
    items = await portal.list_service_requests(
        ctx.partner_org_id,
        assignment_status=assignment_status,
    )
    return PartnerServiceRequestListResponse(
        items=[PartnerServiceRequestSummary.model_validate(i) for i in items]
    )


@router.get("/service-requests/{request_id}", response_model=PartnerServiceRequestDetail)
async def get_partner_service_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(get_partner_session_context),
):
    portal = PartnerPortalService(db)
    item = await portal.get_service_request_for_partner(ctx.partner_org_id, request_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return PartnerServiceRequestDetail.model_validate(item)


@router.post("/service-requests/{request_id}/respond", response_model=PartnerServiceRequestDetail)
async def respond_partner_service_request(
    request_id: int,
    body: PartnerRespondBody,
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(get_partner_session_context),
    current_user: UserResponse = Depends(get_current_user),
):
    portal = PartnerPortalService(db)
    try:
        item = await portal.respond_to_assignment(
            partner_org_id=ctx.partner_org_id,
            request_id=request_id,
            actor_user_id=current_user.id,
            accept=body.accept,
            decline_reason=body.decline_reason,
        )
        await db.commit()
        await db.refresh(item)
        return PartnerServiceRequestDetail.model_validate(item)
    except PartnerPortalError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/delivery-shipments", response_model=DeliveryShipmentListResponse)
async def list_partner_delivery_shipments(
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(get_partner_session_context),
):
    service = LogisticsService(db)
    items = await service.list_for_partner(ctx.partner_org_id, status=status)
    return DeliveryShipmentListResponse(items=[DeliveryShipmentSummary.model_validate(i) for i in items])


@router.post("/delivery-shipments/{shipment_id}/status", response_model=DeliveryShipmentSummary)
async def partner_update_delivery_status(
    shipment_id: int,
    body: UpdateDeliveryShipmentStatusBody,
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(get_partner_session_context),
    current_user: UserResponse = Depends(get_current_user),
):
    service = LogisticsService(db)
    row = await service.get_by_id(shipment_id)
    if row is None or row.partner_org_id != ctx.partner_org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    try:
        row = await service.transition_status(
            row,
            to_status=body.status,
            actor_role="partner",
            actor_user_id=current_user.id,
            note=body.note,
            carrier_name=body.carrier_name,
            tracking_number=body.tracking_number,
            estimated_delivery_at=body.estimated_delivery_at,
        )
        await service.publish_shipment_update(row)
        await service.dispatch_partner_webhook_if_needed(row, partner_org_id=ctx.partner_org_id)
        await db.commit()
        await db.refresh(row)
        return DeliveryShipmentSummary.model_validate(row)
    except LogisticsError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
