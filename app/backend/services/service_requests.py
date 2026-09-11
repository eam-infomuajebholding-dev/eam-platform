"""Business service for Service Request lifecycle."""

from __future__ import annotations

import logging
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.service_requests import ServiceRequest
from models.service_request_transitions import ServiceRequestStatusTransition

logger = logging.getLogger(__name__)

BUILD_VILLA_JOURNEY_TYPE = "build_villa"
ENGINEERING_CONSULTING_JOURNEY_TYPE = "engineering_consulting"
CONTRACTING_JOURNEY_TYPE = "contracting"
REAL_ESTATE_VALUATION_JOURNEY_TYPE = "real_estate_valuation"
SMART_MAINTENANCE_JOURNEY_TYPE = "smart_maintenance"
PROJECT_MANAGEMENT_JOURNEY_TYPE = "project_management"
FURNISHING_JOURNEY_TYPE = "furnishing"
FACILITY_MANAGEMENT_JOURNEY_TYPE = "facility_management"
GOVERNMENT_SERVICES_JOURNEY_TYPE = "government_services"
REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE = "real_estate_development"
REAL_ESTATE_MARKETING_JOURNEY_TYPE = "real_estate_marketing"
SUPPORTED_JOURNEY_TYPES = frozenset(
    {
        BUILD_VILLA_JOURNEY_TYPE,
        ENGINEERING_CONSULTING_JOURNEY_TYPE,
        CONTRACTING_JOURNEY_TYPE,
        REAL_ESTATE_VALUATION_JOURNEY_TYPE,
        SMART_MAINTENANCE_JOURNEY_TYPE,
        PROJECT_MANAGEMENT_JOURNEY_TYPE,
        FURNISHING_JOURNEY_TYPE,
        FACILITY_MANAGEMENT_JOURNEY_TYPE,
        GOVERNMENT_SERVICES_JOURNEY_TYPE,
        REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
        REAL_ESTATE_MARKETING_JOURNEY_TYPE,
    }
)

REQUEST_TYPE_BY_JOURNEY = {
    BUILD_VILLA_JOURNEY_TYPE: "build_villa_discovery",
    ENGINEERING_CONSULTING_JOURNEY_TYPE: "engineering_consulting_intake",
    CONTRACTING_JOURNEY_TYPE: "contracting_intake",
    REAL_ESTATE_VALUATION_JOURNEY_TYPE: "real_estate_valuation_intake",
    SMART_MAINTENANCE_JOURNEY_TYPE: "smart_maintenance_intake",
    PROJECT_MANAGEMENT_JOURNEY_TYPE: "project_management_intake",
    FURNISHING_JOURNEY_TYPE: "furnishing_intake",
    FACILITY_MANAGEMENT_JOURNEY_TYPE: "facility_management_intake",
    GOVERNMENT_SERVICES_JOURNEY_TYPE: "government_services_intake",
    REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE: "real_estate_development_intake",
    REAL_ESTATE_MARKETING_JOURNEY_TYPE: "real_estate_marketing_intake",
}

REFERENCE_PREFIX_BY_JOURNEY = {
    BUILD_VILLA_JOURNEY_TYPE: "BV",
    ENGINEERING_CONSULTING_JOURNEY_TYPE: "EC",
    CONTRACTING_JOURNEY_TYPE: "CT",
    REAL_ESTATE_VALUATION_JOURNEY_TYPE: "RV",
    SMART_MAINTENANCE_JOURNEY_TYPE: "SM",
    PROJECT_MANAGEMENT_JOURNEY_TYPE: "PM",
    FURNISHING_JOURNEY_TYPE: "FR",
    FACILITY_MANAGEMENT_JOURNEY_TYPE: "FM",
    GOVERNMENT_SERVICES_JOURNEY_TYPE: "GS",
    REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE: "RD",
    REAL_ESTATE_MARKETING_JOURNEY_TYPE: "RM",
}

SERVICE_REQUEST_STATUS_SUBMITTED = "submitted"
SERVICE_REQUEST_STATUS_UNDER_REVIEW = "under_review"
SERVICE_REQUEST_STATUS_AWAITING_INFORMATION = "awaiting_information"
SERVICE_REQUEST_STATUS_QUALIFIED = "qualified"

SERVICE_REQUEST_STATUSES = frozenset(
    {
        SERVICE_REQUEST_STATUS_SUBMITTED,
        SERVICE_REQUEST_STATUS_UNDER_REVIEW,
        SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
        SERVICE_REQUEST_STATUS_QUALIFIED,
    }
)

ALLOWED_TRANSITIONS: dict[str, frozenset[str]] = {
    SERVICE_REQUEST_STATUS_SUBMITTED: frozenset({SERVICE_REQUEST_STATUS_UNDER_REVIEW}),
    SERVICE_REQUEST_STATUS_UNDER_REVIEW: frozenset(
        {SERVICE_REQUEST_STATUS_AWAITING_INFORMATION, SERVICE_REQUEST_STATUS_QUALIFIED}
    ),
    SERVICE_REQUEST_STATUS_AWAITING_INFORMATION: frozenset({SERVICE_REQUEST_STATUS_UNDER_REVIEW}),
    SERVICE_REQUEST_STATUS_QUALIFIED: frozenset(),
}

SNAPSHOT_VERSION = 1

CUSTOMER_STATUS_TRANSITION_LABELS: dict[tuple[str, str], str] = {
    (SERVICE_REQUEST_STATUS_SUBMITTED, SERVICE_REQUEST_STATUS_UNDER_REVIEW): "بدأت المراجعة",
    (
        SERVICE_REQUEST_STATUS_UNDER_REVIEW,
        SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
    ): "نحتاج معلومات إضافية",
    (
        SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
        SERVICE_REQUEST_STATUS_UNDER_REVIEW,
    ): "تم استلام المعلومات",
    (SERVICE_REQUEST_STATUS_UNDER_REVIEW, SERVICE_REQUEST_STATUS_QUALIFIED): "تم تأهيل الطلب",
}


class ServiceRequestTransitionError(ValueError):
    """Raised when a service request status transition is invalid."""


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

    async def list_for_operations(
        self,
        *,
        statuses: frozenset[str] | None = None,
        journey_type: str | None = None,
        limit: int = 200,
    ) -> list[ServiceRequest]:
        query = select(ServiceRequest).order_by(ServiceRequest.created_at.desc())
        if statuses:
            query = query.where(ServiceRequest.status.in_(statuses))
        if journey_type:
            query = query.where(ServiceRequest.journey_type == journey_type)
        query = query.limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, request_id: int) -> ServiceRequest | None:
        result = await self.db.execute(select(ServiceRequest).where(ServiceRequest.id == request_id))
        return result.scalar_one_or_none()

    async def list_transitions(self, request_id: int) -> list[ServiceRequestStatusTransition]:
        result = await self.db.execute(
            select(ServiceRequestStatusTransition)
            .where(ServiceRequestStatusTransition.service_request_id == request_id)
            .order_by(ServiceRequestStatusTransition.created_at.asc())
        )
        return list(result.scalars().all())

    async def list_customer_visible_transitions(
        self, request_id: int
    ) -> list[ServiceRequestStatusTransition]:
        return await self.list_customer_activity(request_id)

    async def list_customer_activity(
        self, request_id: int
    ) -> list[ServiceRequestStatusTransition]:
        transitions = await self.list_transitions(request_id)
        visible: list[ServiceRequestStatusTransition] = []
        for row in transitions:
            if self._is_internal_only_transition(row):
                continue
            visible.append(row)
        return visible

    @staticmethod
    def customer_event_label(transition: ServiceRequestStatusTransition) -> str:
        metadata = transition.metadata_json or {}
        if metadata.get("event") == "received":
            return "تم استلام الطلب"
        if metadata.get("event") == "customer_response":
            return "تم استلام المعلومات"
        if transition.from_status != transition.to_status:
            return CUSTOMER_STATUS_TRANSITION_LABELS.get(
                (transition.from_status, transition.to_status),
                "",
            )
        if transition.customer_message:
            return transition.customer_message
        return ""

    @staticmethod
    def _is_internal_only_transition(transition: ServiceRequestStatusTransition) -> bool:
        if transition.customer_message:
            return False
        if transition.from_status != transition.to_status:
            return False
        metadata = transition.metadata_json or {}
        if metadata.get("event") in {"received", "customer_response"}:
            return False
        return bool(transition.internal_note or transition.reason)

    async def transition_status(
        self,
        request: ServiceRequest,
        *,
        to_status: str,
        actor_user_id: str,
        actor_role: str,
        reason: str | None = None,
        customer_message: str | None = None,
        internal_note: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> ServiceRequest:
        if to_status not in SERVICE_REQUEST_STATUSES:
            raise ServiceRequestTransitionError(f"Unknown status: {to_status}")

        allowed = ALLOWED_TRANSITIONS.get(request.status, frozenset())
        if to_status not in allowed:
            raise ServiceRequestTransitionError(
                f"Transition from '{request.status}' to '{to_status}' is not allowed"
            )

        from_status = request.status
        now = datetime.now(timezone.utc)
        request.status = to_status
        request.updated_at = now

        transition = ServiceRequestStatusTransition(
            service_request_id=request.id,
            from_status=from_status,
            to_status=to_status,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            reason=reason,
            customer_message=customer_message,
            internal_note=internal_note,
            metadata_json=metadata,
            created_at=now,
        )
        self.db.add(transition)
        await self.db.flush()
        logger.info(
            "Service request %s transitioned %s -> %s by %s",
            request.reference_code,
            from_status,
            to_status,
            actor_user_id,
        )
        return request

    async def start_professional_review(
        self,
        request_id: int,
        *,
        actor_user_id: str,
        actor_role: str = "admin",
        internal_note: str | None = None,
    ) -> ServiceRequest:
        request = await self.get_by_id(request_id)
        if not request:
            raise ServiceRequestValidationError("Service request not found")
        return await self.transition_status(
            request,
            to_status=SERVICE_REQUEST_STATUS_UNDER_REVIEW,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            internal_note=internal_note,
        )

    async def request_information(
        self,
        request_id: int,
        *,
        actor_user_id: str,
        customer_message: str,
        internal_note: str | None = None,
        actor_role: str = "admin",
    ) -> ServiceRequest:
        if not customer_message.strip():
            raise ServiceRequestValidationError("customer_message is required")
        request = await self.get_by_id(request_id)
        if not request:
            raise ServiceRequestValidationError("Service request not found")
        return await self.transition_status(
            request,
            to_status=SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            customer_message=customer_message.strip(),
            internal_note=internal_note,
        )

    async def mark_qualified(
        self,
        request_id: int,
        *,
        actor_user_id: str,
        reason: str | None = None,
        internal_note: str | None = None,
        actor_role: str = "admin",
    ) -> ServiceRequest:
        request = await self.get_by_id(request_id)
        if not request:
            raise ServiceRequestValidationError("Service request not found")
        return await self.transition_status(
            request,
            to_status=SERVICE_REQUEST_STATUS_QUALIFIED,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            reason=reason,
            internal_note=internal_note,
        )

    async def record_customer_response(
        self,
        request_id: int,
        *,
        user_id: str,
        message: str,
    ) -> ServiceRequestStatusTransition:
        if not message.strip():
            raise ServiceRequestValidationError("message is required")
        request = await self.get_by_id_for_user(request_id, user_id)
        if not request:
            raise ServiceRequestValidationError("Service request not found")
        if request.status != SERVICE_REQUEST_STATUS_AWAITING_INFORMATION:
            raise ServiceRequestTransitionError(
                "Customer responses are only accepted while awaiting information"
            )

        now = datetime.now(timezone.utc)
        transition = ServiceRequestStatusTransition(
            service_request_id=request.id,
            from_status=request.status,
            to_status=request.status,
            actor_user_id=user_id,
            actor_role="customer",
            customer_message=message.strip(),
            metadata_json={"event": "customer_response"},
            created_at=now,
        )
        self.db.add(transition)
        request.updated_at = now
        await self.db.flush()
        return transition

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
        request_type = REQUEST_TYPE_BY_JOURNEY[instance.journey_type]

        service_request = ServiceRequest(
            user_id=instance.user_id,
            journey_instance_id=instance.id,
            journey_type=instance.journey_type,
            request_type=request_type,
            status=SERVICE_REQUEST_STATUS_SUBMITTED,
            reference_code=self._build_reference_code(instance.journey_type, instance.id),
            intake_snapshot=snapshot,
            source_channel=source_channel,
            created_at=now,
            updated_at=now,
        )
        self.db.add(service_request)
        await self.db.flush()
        self.db.add(
            ServiceRequestStatusTransition(
                service_request_id=service_request.id,
                from_status=SERVICE_REQUEST_STATUS_SUBMITTED,
                to_status=SERVICE_REQUEST_STATUS_SUBMITTED,
                actor_user_id=instance.user_id,
                actor_role="system",
                metadata_json={"event": "received"},
                created_at=now,
            )
        )
        await self.db.flush()
        logger.info(
            "Created service request %s for journey instance %s",
            service_request.reference_code,
            instance.id,
        )
        return service_request, True

    async def record_internal_note(
        self,
        request_id: int,
        *,
        actor_user_id: str,
        internal_note: str,
        actor_role: str = "admin",
    ) -> ServiceRequestStatusTransition:
        if not internal_note.strip():
            raise ServiceRequestValidationError("internal_note is required")
        request = await self.get_by_id(request_id)
        if not request:
            raise ServiceRequestValidationError("Service request not found")

        now = datetime.now(timezone.utc)
        transition = ServiceRequestStatusTransition(
            service_request_id=request.id,
            from_status=request.status,
            to_status=request.status,
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            internal_note=internal_note.strip(),
            metadata_json={"event": "internal_note"},
            created_at=now,
        )
        self.db.add(transition)
        request.updated_at = now
        await self.db.flush()
        return transition

    def _validate_instance(self, instance: Any) -> None:
        if instance.journey_type not in SUPPORTED_JOURNEY_TYPES:
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
        snapshot = {
            "snapshot_version": SNAPSHOT_VERSION,
            "journey_type": intake_draft.get("journey_type"),
            "draft_status": intake_draft.get("draft_status"),
            "assembled_at": intake_draft.get("assembled_at"),
        }
        if intake_draft.get("journey_type") == BUILD_VILLA_JOURNEY_TYPE:
            snapshot.update(
                {
                    "project_objective": intake_draft.get("project_objective"),
                    "city": intake_draft.get("city"),
                    "land_ownership_type": intake_draft.get("land_ownership_type"),
                    "land_area_sqm": intake_draft.get("land_area_sqm"),
                    "household_size": intake_draft.get("household_size"),
                    "use_summary": intake_draft.get("use_summary"),
                    "floors": intake_draft.get("floors"),
                    "bedrooms": intake_draft.get("bedrooms"),
                    "selected_spaces": deepcopy(intake_draft.get("selected_spaces") or []),
                    "space_notes": intake_draft.get("space_notes"),
                    "budget_range": intake_draft.get("budget_range"),
                    "desired_start": intake_draft.get("desired_start"),
                    "urgency": intake_draft.get("urgency"),
                    "design_style": intake_draft.get("design_style"),
                    "design_notes": intake_draft.get("design_notes"),
                    "has_documents": intake_draft.get("has_documents"),
                    "document_notes": intake_draft.get("document_notes"),
                    "document_refs": deepcopy(intake_draft.get("document_refs") or []),
                    "desired_service": intake_draft.get("desired_service"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == ENGINEERING_CONSULTING_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "problem_statement": intake_draft.get("problem_statement"),
                    "desired_outcome": intake_draft.get("desired_outcome"),
                    "discipline": intake_draft.get("discipline"),
                    "project_type": intake_draft.get("project_type"),
                    "location": intake_draft.get("location"),
                    "objective": intake_draft.get("objective"),
                    "current_stage": intake_draft.get("current_stage"),
                    "urgency": intake_draft.get("urgency"),
                    "has_documents": intake_draft.get("has_documents"),
                    "document_notes": intake_draft.get("document_notes"),
                    "document_refs": deepcopy(intake_draft.get("document_refs") or []),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == CONTRACTING_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "project_type": intake_draft.get("project_type"),
                    "project_description": intake_draft.get("project_description"),
                    "current_stage": intake_draft.get("current_stage"),
                    "location": intake_draft.get("location"),
                    "design_readiness": intake_draft.get("design_readiness"),
                    "boq_readiness": intake_draft.get("boq_readiness"),
                    "site_readiness": intake_draft.get("site_readiness"),
                    "scope_type": intake_draft.get("scope_type"),
                    "procurement_goal": intake_draft.get("procurement_goal"),
                    "desired_start": intake_draft.get("desired_start"),
                    "urgency": intake_draft.get("urgency"),
                    "budget_range": intake_draft.get("budget_range"),
                    "requirements_notes": intake_draft.get("requirements_notes"),
                    "experience_type": intake_draft.get("experience_type"),
                    "drawings_available": intake_draft.get("drawings_available"),
                    "boq_available": intake_draft.get("boq_available"),
                    "permits_available": intake_draft.get("permits_available"),
                    "site_photos_available": intake_draft.get("site_photos_available"),
                    "document_notes": intake_draft.get("document_notes"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == REAL_ESTATE_VALUATION_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "valuation_purpose": intake_draft.get("valuation_purpose"),
                    "asset_type": intake_draft.get("asset_type"),
                    "location": intake_draft.get("location"),
                    "asset_description": intake_draft.get("asset_description"),
                    "area_sqm": intake_draft.get("area_sqm"),
                    "ownership_status": intake_draft.get("ownership_status"),
                    "deed_available": intake_draft.get("deed_available"),
                    "title_docs_available": intake_draft.get("title_docs_available"),
                    "rent_roll_available": intake_draft.get("rent_roll_available"),
                    "plans_available": intake_draft.get("plans_available"),
                    "document_notes": intake_draft.get("document_notes"),
                    "inspection_readiness": intake_draft.get("inspection_readiness"),
                    "desired_timeline": intake_draft.get("desired_timeline"),
                    "urgency": intake_draft.get("urgency"),
                    "engagement_goal": intake_draft.get("engagement_goal"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == SMART_MAINTENANCE_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "maintenance_category": intake_draft.get("maintenance_category"),
                    "location": intake_draft.get("location"),
                    "issue_description": intake_draft.get("issue_description"),
                    "severity_level": intake_draft.get("severity_level"),
                    "access_readiness": intake_draft.get("access_readiness"),
                    "system_notes": intake_draft.get("system_notes"),
                    "prior_maintenance": intake_draft.get("prior_maintenance"),
                    "service_notes": intake_draft.get("service_notes"),
                    "engagement_goal": intake_draft.get("engagement_goal"),
                    "desired_timeline": intake_draft.get("desired_timeline"),
                    "urgency": intake_draft.get("urgency"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == PROJECT_MANAGEMENT_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "project_type": intake_draft.get("project_type"),
                    "project_stage": intake_draft.get("project_stage"),
                    "project_objective": intake_draft.get("project_objective"),
                    "current_status": intake_draft.get("current_status"),
                    "scope_clarity": intake_draft.get("scope_clarity"),
                    "desired_timeline": intake_draft.get("desired_timeline"),
                    "urgency": intake_draft.get("urgency"),
                    "budget_state": intake_draft.get("budget_state"),
                    "main_challenges": intake_draft.get("main_challenges"),
                    "top_risks": intake_draft.get("top_risks"),
                    "stakeholder_notes": intake_draft.get("stakeholder_notes"),
                    "engagement_goal": intake_draft.get("engagement_goal"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == FURNISHING_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "space_type": intake_draft.get("space_type"),
                    "project_stage": intake_draft.get("project_stage"),
                    "furnishing_goal": intake_draft.get("furnishing_goal"),
                    "style_direction": intake_draft.get("style_direction"),
                    "functional_priorities": intake_draft.get("functional_priorities"),
                    "room_scope": intake_draft.get("room_scope"),
                    "budget_range": intake_draft.get("budget_range"),
                    "target_timeline": intake_draft.get("target_timeline"),
                    "urgency": intake_draft.get("urgency"),
                    "procurement_preference": intake_draft.get("procurement_preference"),
                    "current_readiness": intake_draft.get("current_readiness"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == FACILITY_MANAGEMENT_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "facility_type": intake_draft.get("facility_type"),
                    "location": intake_draft.get("location"),
                    "facility_scope": intake_draft.get("facility_scope"),
                    "operational_challenge": intake_draft.get("operational_challenge"),
                    "service_maturity": intake_draft.get("service_maturity"),
                    "engagement_goal": intake_draft.get("engagement_goal"),
                    "target_timeline": intake_draft.get("target_timeline"),
                    "urgency": intake_draft.get("urgency"),
                    "current_readiness": intake_draft.get("current_readiness"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == GOVERNMENT_SERVICES_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "service_category": intake_draft.get("service_category"),
                    "property_location": intake_draft.get("property_location"),
                    "property_type": intake_draft.get("property_type"),
                    "request_summary": intake_draft.get("request_summary"),
                    "documents_status": intake_draft.get("documents_status"),
                    "urgency": intake_draft.get("urgency"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "asset_context": intake_draft.get("asset_context"),
                    "asset_location": intake_draft.get("asset_location"),
                    "development_objective": intake_draft.get("development_objective"),
                    "intended_use": intake_draft.get("intended_use"),
                    "current_status": intake_draft.get("current_status"),
                    "known_constraints": intake_draft.get("known_constraints"),
                    "documents_readiness": intake_draft.get("documents_readiness"),
                    "target_timeline": intake_draft.get("target_timeline"),
                    "urgency": intake_draft.get("urgency"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        elif intake_draft.get("journey_type") == REAL_ESTATE_MARKETING_JOURNEY_TYPE:
            snapshot.update(
                {
                    "sector_slug": intake_draft.get("sector_slug"),
                    "marketing_goal": intake_draft.get("marketing_goal"),
                    "property_description": intake_draft.get("property_description"),
                    "property_location": intake_draft.get("property_location"),
                    "target_audience": intake_draft.get("target_audience"),
                    "marketing_stage": intake_draft.get("marketing_stage"),
                    "existing_assets": intake_draft.get("existing_assets"),
                    "channels_interest": intake_draft.get("channels_interest"),
                    "target_timeline": intake_draft.get("target_timeline"),
                    "urgency": intake_draft.get("urgency"),
                    "budget_context": intake_draft.get("budget_context"),
                    "preliminary_brief": deepcopy(intake_draft.get("preliminary_brief") or {}),
                    "scope_confirmed": intake_draft.get("scope_confirmed"),
                    "submit_confirmed": intake_draft.get("submit_confirmed"),
                }
            )
        return snapshot

    @staticmethod
    def _build_reference_code(journey_type: str, journey_instance_id: int) -> str:
        prefix = REFERENCE_PREFIX_BY_JOURNEY.get(journey_type, "SR")
        return f"{prefix}-{journey_instance_id:08d}"
