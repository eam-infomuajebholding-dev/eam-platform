import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from schemas.auth import UserResponse
from schemas.logistics import (
    DeliveryShipmentDetail,
    DeliveryShipmentListResponse,
    DeliveryShipmentSummary,
    UpdateDeliveryShipmentStatusBody,
)
from services.logistics import LogisticsError, LogisticsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/operations/logistics/shipments", tags=["operations"])


@router.get("", response_model=DeliveryShipmentListResponse)
async def list_shipments(
    status: str | None = None,
    partner_org_id: int | None = None,
    service_request_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = LogisticsService(db)
    items = await service.list_for_operations(
        status=status,
        partner_org_id=partner_org_id,
        service_request_id=service_request_id,
    )
    return DeliveryShipmentListResponse(items=[DeliveryShipmentSummary.model_validate(i) for i in items])


@router.get("/{shipment_id}", response_model=DeliveryShipmentDetail)
async def get_shipment(
    shipment_id: int,
    db: AsyncSession = Depends(get_db),
    _: UserResponse = Depends(get_admin_user),
):
    service = LogisticsService(db)
    row = await service.get_by_id(shipment_id, with_events=True)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return DeliveryShipmentDetail.model_validate(row)


@router.post("/{shipment_id}/status", response_model=DeliveryShipmentSummary)
async def update_shipment_status_ops(
    shipment_id: int,
    body: UpdateDeliveryShipmentStatusBody,
    db: AsyncSession = Depends(get_db),
    admin: UserResponse = Depends(get_admin_user),
):
    service = LogisticsService(db)
    row = await service.get_by_id(shipment_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    try:
        row = await service.transition_status(
            row,
            to_status=body.status,
            actor_role="ops",
            actor_user_id=admin.id,
            note=body.note,
            carrier_name=body.carrier_name,
            tracking_number=body.tracking_number,
            estimated_delivery_at=body.estimated_delivery_at,
            force=True,
        )
        await service.publish_shipment_update(row)
        if row.partner_org_id:
            await service.dispatch_partner_webhook_if_needed(row, partner_org_id=row.partner_org_id)
        await db.commit()
        await db.refresh(row)
        return DeliveryShipmentSummary.model_validate(row)
    except LogisticsError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
