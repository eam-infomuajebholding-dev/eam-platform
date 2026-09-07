"""Business service for Service Request lifecycle."""

from __future__ import annotations

import logging
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.service_requests import ServiceRequest

logger = logging.getLogger(__name__)

BUILD_VILLA_JOURNEY_TYPE = "build_villa"
BUILD_VILLA_REQUEST_TYPE = "build_villa_discovery"
SERVICE_REQUEST_STATUS_SUBMITTED = "submitted"
SNAPSHOT_VERSION = 1


class ServiceRequestValidationError(ValueError):
    """Raised when a journey cannot be converted to a service request."""


class ServiceRequestService:
    """Creates and reads customer service requests from completed journeys."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_journey_instance_id(self, journey_instance_id: int) -> ServiceRequest | None:
        result = await self.db.execute(
            select(ServiceRequest).where(ServiceRequest.journey_instance_id == journey_instance_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id_for_user(self, request_id: int, user_id: str) -> ServiceRequest | None:
        result = await self.db.execute(
            select(ServiceRequest).where(
                ServiceRequest.id == request_id,
                ServiceRequest.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: str) -> list[ServiceRequest]:
        result = await self.db.execute(
            select(ServiceRequest)
            .where(ServiceRequest.user_id == user_id)
            .order_by(ServiceRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_from_journey(self, instance: Any) -> tuple[ServiceRequest, bool]:
        """Create or return existing service request for a completed journey instance."""
        existing = await self.get_by_journey_instance_id(instance.id)
        if existing:
            return existing, False

        self._validate_instance(instance)

        now = datetime.now(timezone.utc)
        intake_draft = instance.context.get("intake_draft") or {}
        snapshot = self._build_intake_snapshot(intake_draft)
        source_channel = instance.context.get("source_channel")

        service_request = ServiceRequest(
            user_id=instance.user_id,
            journey_instance_id=instance.id,
            journey_type=instance.journey_type,
            request_type=BUILD_VILLA_REQUEST_TYPE,
            status=SERVICE_REQUEST_STATUS_SUBMITTED,
            reference_code=self._build_reference_code(instance.id),
            intake_snapshot=snapshot,
            source_channel=source_channel,
            created_at=now,
            updated_at=now,
        )
        self.db.add(service_request)
        await self.db.flush()
        logger.info(
            "Created service request %s for journey instance %s",
            service_request.reference_code,
            instance.id,
        )
        return service_request, True

    def _validate_instance(self, instance: Any) -> None:
        if instance.journey_type != BUILD_VILLA_JOURNEY_TYPE:
            raise ServiceRequestValidationError(
                f"Unsupported journey type for service request: {instance.journey_type}"
            )
        if instance.status != "completed":
            raise ServiceRequestValidationError("Journey must be completed before creating a service request")
        if not instance.user_id:
            raise ServiceRequestValidationError("Authenticated user is required to create a service request")
        if not instance.context.get("intake_draft"):
            raise ServiceRequestValidationError("intake_draft is required to create a service request")

    @staticmethod
    def _build_intake_snapshot(intake_draft: dict[str, Any]) -> dict[str, Any]:
        return {
            "snapshot_version": SNAPSHOT_VERSION,
            "journey_type": intake_draft.get("journey_type"),
            "city": intake_draft.get("city"),
            "land_ownership_type": intake_draft.get("land_ownership_type"),
            "land_area_sqm": intake_draft.get("land_area_sqm"),
            "has_documents": intake_draft.get("has_documents"),
            "document_notes": intake_draft.get("document_notes"),
            "document_refs": deepcopy(intake_draft.get("document_refs") or []),
            "desired_service": intake_draft.get("desired_service"),
            "draft_status": intake_draft.get("draft_status"),
            "assembled_at": intake_draft.get("assembled_at"),
        }

    @staticmethod
    def _build_reference_code(journey_instance_id: int) -> str:
        return f"BV-{journey_instance_id:08d}"
