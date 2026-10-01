"""Machine-to-machine Partner API (API keys)."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.partner_auth import PartnerAuthContext, get_partner_api_context, require_api_scope
from schemas.logistics import DeliveryShipmentListResponse, DeliveryShipmentSummary, UpdateDeliveryShipmentStatusBody
from schemas.partner_portal import PartnerServiceRequestDetail, PartnerServiceRequestListResponse, PartnerServiceRequestSummary
from services.logistics import LogisticsError, LogisticsService
from services.partner_portal import PartnerPortalService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/partner-integration", tags=["partner-integration"])


@router.get("/shipments", response_model=DeliveryShipmentListResponse)
async def list_shipments_api(
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(require_api_scope("orders:read")),
):
    service = LogisticsService(db)
    items = await service.list_for_partner(ctx.partner_org_id, status=status)
    return DeliveryShipmentListResponse(items=[DeliveryShipmentSummary.model_validate(i) for i in items])


@router.get("/orders", response_model=PartnerServiceRequestListResponse)
async def list_orders_api(
    assignment_status: str | None = None,
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(require_api_scope("orders:read")),
):
    portal = PartnerPortalService(db)
    items = await portal.list_service_requests(ctx.partner_org_id, assignment_status=assignment_status)
    return PartnerServiceRequestListResponse(
        items=[PartnerServiceRequestSummary.model_validate(i) for i in items]
    )


@router.get("/orders/{request_id}", response_model=PartnerServiceRequestDetail)
async def get_order_api(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(require_api_scope("orders:read")),
):
    portal = PartnerPortalService(db)
    item = await portal.get_service_request_for_partner(ctx.partner_org_id, request_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return PartnerServiceRequestDetail.model_validate(item)


@router.post("/shipments/{shipment_id}/status", response_model=DeliveryShipmentSummary)
async def api_update_shipment_status(
    shipment_id: int,
    body: UpdateDeliveryShipmentStatusBody,
    db: AsyncSession = Depends(get_db),
    ctx: PartnerAuthContext = Depends(require_api_scope("orders:write")),
):
    service = LogisticsService(db)
    row = await service.get_by_id(shipment_id)
    if row is None or row.partner_org_id != ctx.partner_org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    try:
        row = await service.transition_status(
            row,
            to_status=body.status,
            actor_role="partner_api",
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
