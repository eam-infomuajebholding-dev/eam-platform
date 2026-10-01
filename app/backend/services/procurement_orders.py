"""Procurement order service — single write authority for PO business object."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.partner_platform import PARTNER_ASSIGNMENT_ACCEPTED, PARTNER_ASSIGNMENT_DECLINED, PARTNER_ASSIGNMENT_PENDING
from models.procurement_orders import (
    PO_STATUS_AWAITING_PARTNER,
    PO_STATUS_PARTNER_ACCEPTED,
    PO_STATUS_PARTNER_DECLINED,
    PO_STATUS_PROVISIONAL,
    ProcurementOrder,
)
from models.service_requests import ServiceRequest

logger = logging.getLogger(__name__)

PROCUREMENT_ORDER_JOURNEY_TYPES = frozenset({"building_materials", "equipment"})


class ProcurementOrderError(Exception):
    pass


class ProcurementOrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _reference_code(service_request: ServiceRequest) -> str:
        return f"PO-{service_request.reference_code}"

    async def get_by_service_request_id(self, service_request_id: int) -> ProcurementOrder | None:
        result = await self.db.execute(
            select(ProcurementOrder).where(ProcurementOrder.service_request_id == service_request_id)
        )
        return result.scalar_one_or_none()

    async def create_for_service_request(self, service_request: ServiceRequest) -> ProcurementOrder | None:
        if service_request.journey_type not in PROCUREMENT_ORDER_JOURNEY_TYPES:
            return None
        existing = await self.get_by_service_request_id(service_request.id)
        if existing:
            return existing

        snapshot = service_request.intake_snapshot or {}
        invoice = snapshot.get("procurement_invoice") or {}
        if not invoice:
            return None

        partner_status = service_request.partner_assignment_status
        if partner_status == PARTNER_ASSIGNMENT_PENDING:
            status = PO_STATUS_AWAITING_PARTNER
        elif partner_status == PARTNER_ASSIGNMENT_ACCEPTED:
            status = PO_STATUS_PARTNER_ACCEPTED
        elif partner_status == PARTNER_ASSIGNMENT_DECLINED:
            status = PO_STATUS_PARTNER_DECLINED
        else:
            status = PO_STATUS_PROVISIONAL

        total_raw = invoice.get("total_amount")
        total_amount = Decimal(str(total_raw)) if total_raw is not None else None

        now = datetime.now(timezone.utc)
        row = ProcurementOrder(
            service_request_id=service_request.id,
            reference_code=self._reference_code(service_request),
            journey_type=service_request.journey_type,
            status=status,
            currency=str(invoice.get("currency") or "SAR"),
            total_amount=total_amount,
            line_items=list(invoice.get("line_items") or []),
            delivery_location=invoice.get("delivery_location") or snapshot.get("delivery_location"),
            partner_org_id=service_request.partner_org_id,
            invoice_snapshot=invoice,
            created_at=now,
            updated_at=now,
        )
        self.db.add(row)
        await self.db.flush()
        logger.info("Created procurement order %s for SR %s", row.reference_code, service_request.reference_code)
        return row

    async def sync_partner_assignment(self, service_request: ServiceRequest) -> ProcurementOrder | None:
        row = await self.get_by_service_request_id(service_request.id)
        if row is None:
            return None
        now = datetime.now(timezone.utc)
        pas = service_request.partner_assignment_status
        if pas == PARTNER_ASSIGNMENT_PENDING:
            row.status = PO_STATUS_AWAITING_PARTNER
        elif pas == PARTNER_ASSIGNMENT_ACCEPTED:
            row.status = PO_STATUS_PARTNER_ACCEPTED
        elif pas == PARTNER_ASSIGNMENT_DECLINED:
            row.status = PO_STATUS_PARTNER_DECLINED
        row.updated_at = now
        await self.db.flush()
        if row.status == PO_STATUS_PARTNER_ACCEPTED:
            from services.logistics import LogisticsService

            logistics = LogisticsService(self.db)
            shipment = await logistics.ensure_shipment_for_procurement_order(row)
            if shipment is not None:
                await logistics.sync_service_request_snapshot(row.service_request_id)
        return row

    async def list_for_operations(
        self,
        *,
        partner_org_id: int | None = None,
        service_request_id: int | None = None,
        status: str | None = None,
        limit: int = 100,
    ) -> list[ProcurementOrder]:
        query = select(ProcurementOrder).order_by(ProcurementOrder.created_at.desc()).limit(limit)
        if partner_org_id is not None:
            query = query.where(ProcurementOrder.partner_org_id == partner_org_id)
        if service_request_id is not None:
            query = query.where(ProcurementOrder.service_request_id == service_request_id)
        if status:
            query = query.where(ProcurementOrder.status == status)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, order_id: int) -> ProcurementOrder | None:
        result = await self.db.execute(select(ProcurementOrder).where(ProcurementOrder.id == order_id))
        return result.scalar_one_or_none()

    def summary_payload(self, row: ProcurementOrder) -> dict[str, Any]:
        return {
            "id": row.id,
            "reference_code": row.reference_code,
            "service_request_id": row.service_request_id,
            "journey_type": row.journey_type,
            "status": row.status,
            "currency": row.currency,
            "total_amount": float(row.total_amount) if row.total_amount is not None else None,
            "delivery_location": row.delivery_location,
            "partner_org_id": row.partner_org_id,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
