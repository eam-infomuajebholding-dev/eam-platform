"""Logistics service — delivery shipment authority."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.logistics import (
    SHIPMENT_STATUS_AWAITING_DISPATCH,
    SHIPMENT_STATUS_DELIVERED,
    SHIPMENT_STATUS_DELIVERY_FAILED,
    SHIPMENT_STATUS_DISPATCHED,
    SHIPMENT_STATUS_IN_TRANSIT,
    SHIPMENT_STATUS_OUT_FOR_DELIVERY,
    SHIPMENT_TRANSITIONS,
    DeliveryShipment,
    DeliveryShipmentEvent,
)
from models.procurement_orders import PO_STATUS_PARTNER_ACCEPTED, ProcurementOrder
from models.service_requests import ServiceRequest

logger = logging.getLogger(__name__)


class LogisticsError(Exception):
    pass


STATUS_LABELS_AR: dict[str, str] = {
    "awaiting_dispatch": "بانتظار الشحن",
    "dispatched": "تم التجهيز للشحن",
    "in_transit": "في الطريق",
    "out_for_delivery": "خارج للتسليم",
    "delivered": "تم التسليم",
    "delivery_failed": "تعذّر التسليم",
    "cancelled": "ملغى",
}


class LogisticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _reference_code(procurement_order: ProcurementOrder) -> str:
        return procurement_order.reference_code.replace("PO-", "SH-", 1)

    async def get_by_procurement_order_id(self, po_id: int) -> DeliveryShipment | None:
        result = await self.db.execute(
            select(DeliveryShipment).where(DeliveryShipment.procurement_order_id == po_id)
        )
        return result.scalar_one_or_none()

    async def get_by_service_request_id(self, sr_id: int) -> DeliveryShipment | None:
        result = await self.db.execute(
            select(DeliveryShipment).where(DeliveryShipment.service_request_id == sr_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, shipment_id: int, *, with_events: bool = False) -> DeliveryShipment | None:
        query = select(DeliveryShipment).where(DeliveryShipment.id == shipment_id)
        if with_events:
            query = query.options(selectinload(DeliveryShipment.events))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def ensure_shipment_for_procurement_order(
        self, procurement_order: ProcurementOrder
    ) -> DeliveryShipment | None:
        if procurement_order.status != PO_STATUS_PARTNER_ACCEPTED:
            return None
        existing = await self.get_by_procurement_order_id(procurement_order.id)
        if existing:
            return existing

        now = datetime.now(timezone.utc)
        row = DeliveryShipment(
            procurement_order_id=procurement_order.id,
            service_request_id=procurement_order.service_request_id,
            reference_code=self._reference_code(procurement_order),
            status=SHIPMENT_STATUS_AWAITING_DISPATCH,
            delivery_address=procurement_order.delivery_location,
            partner_org_id=procurement_order.partner_org_id,
            created_at=now,
            updated_at=now,
        )
        self.db.add(row)
        await self.db.flush()
        self.db.add(
            DeliveryShipmentEvent(
                shipment_id=row.id,
                from_status=SHIPMENT_STATUS_AWAITING_DISPATCH,
                to_status=SHIPMENT_STATUS_AWAITING_DISPATCH,
                actor_role="system",
                note="Shipment created after partner acceptance",
                created_at=now,
            )
        )
        await self.db.flush()
        logger.info("Created delivery shipment %s for PO %s", row.reference_code, procurement_order.reference_code)
        return row

    async def transition_status(
        self,
        shipment: DeliveryShipment,
        *,
        to_status: str,
        actor_role: str,
        actor_user_id: str | None = None,
        note: str | None = None,
        carrier_name: str | None = None,
        tracking_number: str | None = None,
        estimated_delivery_at: datetime | None = None,
        force: bool = False,
    ) -> DeliveryShipment:
        from_status = shipment.status
        if to_status == from_status:
            return shipment
        allowed = SHIPMENT_TRANSITIONS.get(from_status, frozenset())
        if not force and to_status not in allowed:
            raise LogisticsError(f"Invalid transition {from_status} → {to_status}")

        if (
            not force
            and to_status == SHIPMENT_STATUS_DISPATCHED
            and actor_role in {"partner", "partner_api"}
        ):
            effective_tracking = (tracking_number or shipment.tracking_number or "").strip()
            if not effective_tracking:
                raise LogisticsError("tracking_number is required when marking dispatched")

        now = datetime.now(timezone.utc)
        shipment.status = to_status
        shipment.updated_at = now
        if carrier_name is not None:
            shipment.carrier_name = carrier_name.strip() or None
        if tracking_number is not None:
            shipment.tracking_number = tracking_number.strip() or None
        if estimated_delivery_at is not None:
            shipment.estimated_delivery_at = estimated_delivery_at
        if to_status == SHIPMENT_STATUS_DELIVERED:
            shipment.delivered_at = now

        self.db.add(
            DeliveryShipmentEvent(
                shipment_id=shipment.id,
                from_status=from_status,
                to_status=to_status,
                actor_role=actor_role,
                actor_user_id=actor_user_id,
                note=note,
                created_at=now,
            )
        )
        await self.db.flush()
        return shipment

    async def publish_shipment_update(self, shipment: DeliveryShipment) -> None:
        """Sync customer snapshot + activity timeline after status change."""
        await self.sync_service_request_snapshot(shipment.service_request_id)
        if shipment.status in {
            SHIPMENT_STATUS_DISPATCHED,
            SHIPMENT_STATUS_IN_TRANSIT,
            SHIPMENT_STATUS_OUT_FOR_DELIVERY,
            SHIPMENT_STATUS_DELIVERED,
            SHIPMENT_STATUS_DELIVERY_FAILED,
        }:
            from services.service_requests import ServiceRequestService

            await ServiceRequestService(self.db).record_delivery_logistics_event(
                shipment.service_request_id,
                shipment_reference=shipment.reference_code,
                logistics_status=shipment.status,
                tracking_number=shipment.tracking_number,
            )

    async def sync_service_request_snapshot(self, service_request_id: int) -> None:
        shipment = await self.get_by_service_request_id(service_request_id)
        if shipment is None:
            return
        result = await self.db.execute(
            select(ServiceRequest).where(ServiceRequest.id == service_request_id)
        )
        sr = result.scalar_one_or_none()
        if sr is None:
            return
        snap = dict(sr.intake_snapshot or {})
        snap["delivery_logistics"] = self.summary_payload(shipment)
        sr.intake_snapshot = snap
        await self.db.flush()

    def summary_payload(self, row: DeliveryShipment) -> dict[str, Any]:
        return {
            "id": row.id,
            "reference_code": row.reference_code,
            "status": row.status,
            "status_label_ar": STATUS_LABELS_AR.get(row.status, row.status),
            "delivery_address": row.delivery_address,
            "carrier_name": row.carrier_name,
            "tracking_number": row.tracking_number,
            "estimated_delivery_at": row.estimated_delivery_at.isoformat() if row.estimated_delivery_at else None,
            "delivered_at": row.delivered_at.isoformat() if row.delivered_at else None,
            "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        }

    async def list_for_operations(
        self,
        *,
        status: str | None = None,
        partner_org_id: int | None = None,
        service_request_id: int | None = None,
        limit: int = 100,
    ) -> list[DeliveryShipment]:
        query = select(DeliveryShipment).order_by(DeliveryShipment.updated_at.desc()).limit(limit)
        if status:
            query = query.where(DeliveryShipment.status == status)
        if partner_org_id is not None:
            query = query.where(DeliveryShipment.partner_org_id == partner_org_id)
        if service_request_id is not None:
            query = query.where(DeliveryShipment.service_request_id == service_request_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def list_for_partner(self, partner_org_id: int, *, status: str | None = None) -> list[DeliveryShipment]:
        query = (
            select(DeliveryShipment)
            .where(DeliveryShipment.partner_org_id == partner_org_id)
            .order_by(DeliveryShipment.updated_at.desc())
        )
        if status:
            query = query.where(DeliveryShipment.status == status)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def dispatch_partner_webhook_if_needed(
        self,
        shipment: DeliveryShipment,
        *,
        partner_org_id: int,
    ) -> None:
        from models.partner_platform import WEBHOOK_EVENT_DELIVERY_STATUS_CHANGED
        from services.partner_events import delivery_shipment_payload
        from services.partner_webhooks import dispatch_partner_webhooks

        await dispatch_partner_webhooks(
            self.db,
            partner_org_id=partner_org_id,
            event_type=WEBHOOK_EVENT_DELIVERY_STATUS_CHANGED,
            payload=delivery_shipment_payload(shipment),
        )
