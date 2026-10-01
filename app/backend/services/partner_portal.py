"""Partner-facing service request operations."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.auth import User
from models.partner_platform import (
    PARTNER_ASSIGNMENT_ACCEPTED,
    PARTNER_ASSIGNMENT_DECLINED,
    PARTNER_ASSIGNMENT_PENDING,
    PARTNER_MEMBER_ROLES,
    PartnerMembership,
    WEBHOOK_EVENT_PARTNER_ACCEPTED,
    WEBHOOK_EVENT_PARTNER_DECLINED,
)
from models.service_requests import ServiceRequest
from models.service_request_transitions import ServiceRequestStatusTransition
from services.partner_events import service_request_partner_payload
from services.partner_webhooks import dispatch_partner_webhooks

class PartnerPortalError(ValueError):
    pass


class PartnerPortalService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_membership(self, user_id: str) -> PartnerMembership | None:
        result = await self.db.execute(
            select(PartnerMembership).where(
                PartnerMembership.user_id == user_id,
                PartnerMembership.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def invite_member(
        self,
        *,
        partner_org_id: int,
        user_email: str,
        role: str,
        invited_by_user_id: str,
    ) -> PartnerMembership:
        if role not in PARTNER_MEMBER_ROLES:
            raise PartnerPortalError("Invalid partner role")
        normalized_email = user_email.strip().lower()
        result = await self.db.execute(select(User).where(User.email == normalized_email))
        user = result.scalar_one_or_none()
        if user is None:
            raise PartnerPortalError("User not found — they must sign in to EAM once before invite")

        existing = await self.db.execute(
            select(PartnerMembership).where(
                PartnerMembership.partner_org_id == partner_org_id,
                PartnerMembership.user_id == user.id,
            )
        )
        row = existing.scalar_one_or_none()
        if row:
            row.is_active = True
            row.role = role
            await self.db.flush()
            return row

        membership = PartnerMembership(
            partner_org_id=partner_org_id,
            user_id=user.id,
            role=role,
            invited_by_user_id=invited_by_user_id,
        )
        self.db.add(membership)
        await self.db.flush()
        return membership

    async def list_service_requests(
        self,
        partner_org_id: int,
        *,
        assignment_status: str | None = None,
        limit: int = 100,
    ) -> list[ServiceRequest]:
        query = (
            select(ServiceRequest)
            .where(ServiceRequest.partner_org_id == partner_org_id)
            .order_by(ServiceRequest.created_at.desc())
            .limit(limit)
        )
        if assignment_status:
            query = query.where(ServiceRequest.partner_assignment_status == assignment_status)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_service_request_for_partner(
        self, partner_org_id: int, request_id: int
    ) -> ServiceRequest | None:
        result = await self.db.execute(
            select(ServiceRequest).where(
                ServiceRequest.id == request_id,
                ServiceRequest.partner_org_id == partner_org_id,
            )
        )
        return result.scalar_one_or_none()

    async def respond_to_assignment(
        self,
        *,
        partner_org_id: int,
        request_id: int,
        actor_user_id: str,
        accept: bool,
        decline_reason: str | None = None,
    ) -> ServiceRequest:
        sr = await self.get_service_request_for_partner(partner_org_id, request_id)
        if sr is None:
            raise PartnerPortalError("Service request not found")
        if sr.partner_assignment_status != PARTNER_ASSIGNMENT_PENDING:
            raise PartnerPortalError("Request is not pending partner response")

        now = datetime.now(timezone.utc)
        if accept:
            sr.partner_assignment_status = PARTNER_ASSIGNMENT_ACCEPTED
            sr.partner_decline_reason = None
            event_type = WEBHOOK_EVENT_PARTNER_ACCEPTED
        else:
            sr.partner_assignment_status = PARTNER_ASSIGNMENT_DECLINED
            sr.partner_decline_reason = (decline_reason or "").strip() or None
            event_type = WEBHOOK_EVENT_PARTNER_DECLINED

        sr.partner_responded_at = now
        sr.updated_at = now

        self.db.add(
            ServiceRequestStatusTransition(
                service_request_id=sr.id,
                from_status=sr.status,
                to_status=sr.status,
                actor_user_id=actor_user_id,
                actor_role="partner",
                internal_note=f"Partner {'accepted' if accept else 'declined'} fulfillment",
                metadata_json={
                    "partner_assignment_status": sr.partner_assignment_status,
                    "decline_reason": sr.partner_decline_reason,
                },
                created_at=now,
            )
        )
        await self.db.flush()

        await dispatch_partner_webhooks(
            self.db,
            partner_org_id=partner_org_id,
            event_type=event_type,
            payload=service_request_partner_payload(sr),
        )

        from services.procurement_orders import ProcurementOrderService

        po_service = ProcurementOrderService(self.db)
        po = await po_service.sync_partner_assignment(sr)
        if po is not None:
            snap = dict(sr.intake_snapshot or {})
            snap["procurement_order"] = po_service.summary_payload(po)
            from services.logistics import LogisticsService

            logistics = LogisticsService(self.db)
            shipment = await logistics.get_by_service_request_id(sr.id)
            if shipment is not None:
                snap["delivery_logistics"] = logistics.summary_payload(shipment)
            sr.intake_snapshot = snap
            await self.db.flush()

        return sr
