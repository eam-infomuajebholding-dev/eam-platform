from datetime import datetime, timezone
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.journey_definitions import JourneyDefinition
from models.journey_events import JourneyEvent
from models.journey_instances import JourneyInstance
from services.build_villa_schema import BUILD_VILLA_STEP_ORDER, REVISIT_BLOCKED_FROM
from services.build_villa_validators import (
    FieldValidationError,
    assemble_intake_draft as assemble_build_villa_intake_draft,
    assemble_preliminary_villa_brief,
    validate_build_villa_step,
)
from services.contracting_validators import (
    CONTRACTING_JOURNEY_TYPE,
    assemble_contracting_intake_draft,
    assemble_contracting_readiness_brief,
    validate_contracting_step,
)
from services.valuation_validators import (
    REAL_ESTATE_VALUATION_JOURNEY_TYPE,
    assemble_valuation_intake_draft,
    assemble_valuation_readiness_brief,
    validate_valuation_step,
)
from services.smart_maintenance_validators import (
    SMART_MAINTENANCE_JOURNEY_TYPE,
    assemble_maintenance_readiness_brief,
    assemble_smart_maintenance_intake_draft,
    validate_smart_maintenance_step,
)
from services.project_management_validators import (
    PROJECT_MANAGEMENT_JOURNEY_TYPE,
    assemble_project_management_intake_draft,
    assemble_project_management_readiness_brief,
    validate_project_management_step,
)
from services.facility_management_validators import (
    FACILITY_MANAGEMENT_JOURNEY_TYPE,
    assemble_facility_management_intake_draft,
    assemble_facility_management_readiness_brief,
    validate_facility_management_step,
)
from services.government_services_validators import (
    GOVERNMENT_SERVICES_JOURNEY_TYPE,
    assemble_government_services_intake_draft,
    assemble_government_services_task_roadmap,
    validate_government_services_step,
)
from services.real_estate_development_validators import (
    REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
    assemble_development_opportunity_snapshot,
    assemble_real_estate_development_intake_draft,
    validate_real_estate_development_step,
)
from services.real_estate_marketing_validators import (
    REAL_ESTATE_MARKETING_JOURNEY_TYPE,
    assemble_marketing_readiness_brief,
    assemble_real_estate_marketing_intake_draft,
    validate_real_estate_marketing_step,
)
from services.furnishing_validators import (
    FURNISHING_JOURNEY_TYPE,
    assemble_furnishing_intake_draft,
    assemble_furnishing_readiness_brief,
    validate_furnishing_step,
)
from services.engineering_consulting_validators import (
    ENGINEERING_CONSULTING_JOURNEY_TYPE,
    assemble_intake_draft as assemble_engineering_consulting_intake_draft,
    assemble_preliminary_brief,
    validate_engineering_consulting_step,
)
from services.jos_validators import (
    JourneyValidationError,
    get_next_step_key,
    get_step_definition,
    validate_step_input,
    validate_workflow_definition,
)
from services.service_requests import ServiceRequestService

BUILD_VILLA_JOURNEY_TYPE = "build_villa"
INTAKE_COMPLETE_STEP = "intake_complete"
EC_BRIEF_REVIEW_STEP = "brief_review"
EC_HANDOFF_COMPLETE_STEP = "handoff_complete"
CONTRACTING_READINESS_BRIEF_STEP = "readiness_brief"
CONTRACTING_INTAKE_COMPLETE_STEP = "intake_complete"

VALUATION_READINESS_BRIEF_STEP = "readiness_brief"
VALUATION_INTAKE_COMPLETE_STEP = "intake_complete"

DUPLICATE_GUARD_JOURNEY_TYPES = frozenset(
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
PINNED_WORKFLOW_CONTEXT_KEY = "_pinned_workflow"


class JosAccessError(PermissionError):
    """Raised when a caller cannot access a journey instance."""


class JosStateError(ValueError):
    """Raised when a journey operation is invalid for the current state."""


class JourneyNotFoundError(JosStateError):
    """Raised when a journey instance or definition cannot be found."""


class JosDuplicateActiveJourneyError(JosStateError):
    """Raised when an active journey already exists for the same identity."""

    def __init__(self, existing_instance_id: int):
        self.existing_instance_id = existing_instance_id
        super().__init__(f"Active journey already exists: {existing_instance_id}")


class JosService:
    """Backend-owned Journey Operating System orchestration service."""

    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_definitions(self) -> list[JourneyDefinition]:
        result = await self.db.execute(
            select(JourneyDefinition)
            .where(JourneyDefinition.is_active.is_(True))
            .order_by(JourneyDefinition.journey_type.asc())
        )
        return list(result.scalars().all())

    async def get_definition_by_type(self, journey_type: str) -> JourneyDefinition | None:
        result = await self.db.execute(
            select(JourneyDefinition).where(
                JourneyDefinition.journey_type == journey_type,
                JourneyDefinition.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def start_journey(
        self,
        journey_type: str,
        *,
        anonymous_session_id: str | None = None,
        user_id: str | None = None,
        initial_context: dict[str, Any] | None = None,
    ) -> JourneyInstance:
        definition = await self.get_definition_by_type(journey_type)
        if not definition:
            raise JosStateError(f"Unknown or inactive journey type: {journey_type}")

        if not anonymous_session_id and not user_id:
            raise JourneyValidationError("anonymous_session_id or user_id is required")

        if journey_type in DUPLICATE_GUARD_JOURNEY_TYPES:
            existing = await self._find_active_instance(
                journey_type=journey_type,
                user_id=user_id,
                anonymous_session_id=anonymous_session_id,
            )
            if existing:
                raise JosDuplicateActiveJourneyError(existing.id)

        workflow = validate_workflow_definition(definition.workflow_definition)
        initial_step = workflow["initial_step"]
        context = dict(initial_context or {})
        context[PINNED_WORKFLOW_CONTEXT_KEY] = definition.workflow_definition

        instance = JourneyInstance(
            journey_definition_id=definition.id,
            journey_type=journey_type,
            status=self.ACTIVE,
            current_step_key=initial_step,
            context=context,
            user_id=user_id,
            anonymous_session_id=anonymous_session_id,
        )
        self.db.add(instance)
        await self.db.flush()

        await self._record_event(
            instance.id,
            event_type="journey_started",
            from_step=None,
            to_step=initial_step,
            payload={"journey_type": journey_type, "context": context},
        )

        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def get_instance(self, instance_id: int) -> JourneyInstance | None:
        result = await self.db.execute(
            select(JourneyInstance).where(JourneyInstance.id == instance_id)
        )
        return result.scalar_one_or_none()

    async def advance(
        self,
        instance_id: int,
        *,
        input_data: dict[str, Any] | None = None,
        anonymous_session_id: str | None = None,
        user_id: str | None = None,
    ) -> JourneyInstance:
        instance = await self._get_owned_instance(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=user_id,
        )
        if instance.status == self.COMPLETED:
            raise JosStateError("Completed journeys cannot be advanced")

        if instance.status == self.PAUSED:
            raise JosStateError("Paused journeys must be resumed before advancing")

        definition = await self._get_definition(instance.journey_definition_id)
        workflow = self._workflow_for_instance(instance, definition)
        from_step = instance.current_step_key

        self._ensure_step_can_advance(instance, workflow, from_step)

        validated_input = validate_step_input(workflow, from_step, input_data)
        if instance.journey_type == BUILD_VILLA_JOURNEY_TYPE:
            try:
                validated_input = validate_build_villa_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == ENGINEERING_CONSULTING_JOURNEY_TYPE:
            try:
                validated_input = validate_engineering_consulting_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == CONTRACTING_JOURNEY_TYPE:
            try:
                validated_input = validate_contracting_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == REAL_ESTATE_VALUATION_JOURNEY_TYPE:
            try:
                validated_input = validate_valuation_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == SMART_MAINTENANCE_JOURNEY_TYPE:
            try:
                validated_input = validate_smart_maintenance_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == PROJECT_MANAGEMENT_JOURNEY_TYPE:
            try:
                validated_input = validate_project_management_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == FURNISHING_JOURNEY_TYPE:
            try:
                validated_input = validate_furnishing_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == FACILITY_MANAGEMENT_JOURNEY_TYPE:
            try:
                validated_input = validate_facility_management_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == GOVERNMENT_SERVICES_JOURNEY_TYPE:
            try:
                validated_input = validate_government_services_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE:
            try:
                validated_input = validate_real_estate_development_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise
        elif instance.journey_type == REAL_ESTATE_MARKETING_JOURNEY_TYPE:
            try:
                validated_input = validate_real_estate_marketing_step(from_step, validated_input)
            except FieldValidationError as exc:
                await self._record_event(
                    instance.id,
                    event_type="validation_failed",
                    from_step=from_step,
                    to_step=from_step,
                    payload={"errors": exc.errors, "input": input_data or {}},
                )
                await self.db.commit()
                raise

        merged_context = dict(instance.context or {})
        merged_context.update(validated_input)

        next_step = get_next_step_key(workflow, from_step)
        if next_step is None:
            raise JosStateError(f"Step '{from_step}' has no next transition")

        if (
            instance.journey_type == BUILD_VILLA_JOURNEY_TYPE
            and next_step == EC_BRIEF_REVIEW_STEP
        ):
            merged_context["preliminary_brief"] = assemble_preliminary_villa_brief(merged_context)

        if (
            instance.journey_type == BUILD_VILLA_JOURNEY_TYPE
            and next_step == INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_build_villa_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == ENGINEERING_CONSULTING_JOURNEY_TYPE
            and next_step == EC_BRIEF_REVIEW_STEP
        ):
            merged_context["preliminary_brief"] = assemble_preliminary_brief(merged_context)

        if (
            instance.journey_type == ENGINEERING_CONSULTING_JOURNEY_TYPE
            and next_step == EC_HANDOFF_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_engineering_consulting_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == CONTRACTING_JOURNEY_TYPE
            and next_step == CONTRACTING_READINESS_BRIEF_STEP
        ):
            merged_context["preliminary_brief"] = assemble_contracting_readiness_brief(merged_context)

        if (
            instance.journey_type == CONTRACTING_JOURNEY_TYPE
            and next_step == CONTRACTING_INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_contracting_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == REAL_ESTATE_VALUATION_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            merged_context["preliminary_brief"] = assemble_valuation_readiness_brief(merged_context)

        if (
            instance.journey_type == REAL_ESTATE_VALUATION_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_valuation_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == SMART_MAINTENANCE_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            merged_context["preliminary_brief"] = assemble_maintenance_readiness_brief(merged_context)

        if (
            instance.journey_type == SMART_MAINTENANCE_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_smart_maintenance_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == PROJECT_MANAGEMENT_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            merged_context["preliminary_brief"] = assemble_project_management_readiness_brief(merged_context)

        if (
            instance.journey_type == PROJECT_MANAGEMENT_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_project_management_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == FURNISHING_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            merged_context["preliminary_brief"] = assemble_furnishing_readiness_brief(merged_context)

        if (
            instance.journey_type == FURNISHING_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_furnishing_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == FACILITY_MANAGEMENT_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            merged_context["preliminary_brief"] = assemble_facility_management_readiness_brief(merged_context)

        if (
            instance.journey_type == FACILITY_MANAGEMENT_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_facility_management_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == GOVERNMENT_SERVICES_JOURNEY_TYPE
            and next_step == "task_roadmap_brief"
        ):
            merged_context["preliminary_brief"] = assemble_government_services_task_roadmap(merged_context)

        if (
            instance.journey_type == GOVERNMENT_SERVICES_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_government_services_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE
            and next_step == "opportunity_snapshot_brief"
        ):
            merged_context["preliminary_brief"] = assemble_development_opportunity_snapshot(merged_context)

        if (
            instance.journey_type == REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_real_estate_development_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        if (
            instance.journey_type == REAL_ESTATE_MARKETING_JOURNEY_TYPE
            and next_step == "marketing_readiness_brief"
        ):
            merged_context["preliminary_brief"] = assemble_marketing_readiness_brief(merged_context)

        if (
            instance.journey_type == REAL_ESTATE_MARKETING_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            merged_context["intake_draft"] = assemble_real_estate_marketing_intake_draft(merged_context)
            merged_context["draft_status"] = "ready_for_handoff"

        instance.context = merged_context
        instance.current_step_key = next_step
        instance.updated_at = datetime.now(timezone.utc)

        await self._record_event(
            instance.id,
            event_type="step_advanced",
            from_step=from_step,
            to_step=next_step,
            payload={"input": validated_input, "context": merged_context},
        )

        if (
            instance.journey_type == BUILD_VILLA_JOURNEY_TYPE
            and next_step == EC_BRIEF_REVIEW_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == BUILD_VILLA_JOURNEY_TYPE
            and next_step == INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == ENGINEERING_CONSULTING_JOURNEY_TYPE
            and next_step == EC_BRIEF_REVIEW_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == ENGINEERING_CONSULTING_JOURNEY_TYPE
            and next_step == EC_HANDOFF_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == CONTRACTING_JOURNEY_TYPE
            and next_step == CONTRACTING_READINESS_BRIEF_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == CONTRACTING_JOURNEY_TYPE
            and next_step == CONTRACTING_INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == REAL_ESTATE_VALUATION_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == REAL_ESTATE_VALUATION_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == SMART_MAINTENANCE_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == SMART_MAINTENANCE_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == PROJECT_MANAGEMENT_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == PROJECT_MANAGEMENT_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == FURNISHING_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == FURNISHING_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == FACILITY_MANAGEMENT_JOURNEY_TYPE
            and next_step == VALUATION_READINESS_BRIEF_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == FACILITY_MANAGEMENT_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == GOVERNMENT_SERVICES_JOURNEY_TYPE
            and next_step == "task_roadmap_brief"
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == GOVERNMENT_SERVICES_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE
            and next_step == "opportunity_snapshot_brief"
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        if (
            instance.journey_type == REAL_ESTATE_MARKETING_JOURNEY_TYPE
            and next_step == "marketing_readiness_brief"
        ):
            await self._record_event(
                instance.id,
                event_type="preliminary_brief_generated",
                from_step=from_step,
                to_step=next_step,
                payload={"preliminary_brief": merged_context.get("preliminary_brief")},
            )

        if (
            instance.journey_type == REAL_ESTATE_MARKETING_JOURNEY_TYPE
            and next_step == VALUATION_INTAKE_COMPLETE_STEP
        ):
            await self._record_event(
                instance.id,
                event_type="intake_draft_assembled",
                from_step=from_step,
                to_step=next_step,
                payload={"intake_draft": merged_context.get("intake_draft")},
            )

        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def revisit_step(
        self,
        instance_id: int,
        target_step_key: str,
        *,
        anonymous_session_id: str | None = None,
        user_id: str | None = None,
    ) -> JourneyInstance:
        instance = await self._get_owned_instance(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=user_id,
        )
        if instance.journey_type != BUILD_VILLA_JOURNEY_TYPE:
            raise JosStateError("Step revisit is supported for build_villa only")
        if instance.status != self.ACTIVE:
            raise JosStateError("Only active journeys can revisit a step")
        if target_step_key in REVISIT_BLOCKED_FROM:
            raise JosStateError(f"Step '{target_step_key}' cannot be revisited")
        if target_step_key not in BUILD_VILLA_STEP_ORDER:
            raise JosStateError(f"Unknown revisit target step '{target_step_key}'")

        current_step = instance.current_step_key
        if current_step not in BUILD_VILLA_STEP_ORDER:
            raise JosStateError(f"Current step '{current_step}' is not revisitable")

        target_index = BUILD_VILLA_STEP_ORDER.index(target_step_key)
        current_index = BUILD_VILLA_STEP_ORDER.index(current_step)
        if target_index >= current_index:
            raise JosStateError("Revisit target must be before the current step")

        context = dict(instance.context or {})
        brief_index = BUILD_VILLA_STEP_ORDER.index(EC_BRIEF_REVIEW_STEP)
        if target_index < brief_index:
            for key in ("preliminary_brief", "intake_draft", "draft_status", "scope_confirmed", "submit_confirmed"):
                context.pop(key, None)

        instance.context = context
        instance.current_step_key = target_step_key
        instance.updated_at = datetime.now(timezone.utc)

        await self._record_event(
            instance.id,
            event_type="journey_step_revisited",
            from_step=current_step,
            to_step=target_step_key,
            payload={"target_step_key": target_step_key},
        )
        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def pause(
        self,
        instance_id: int,
        *,
        anonymous_session_id: str | None = None,
        user_id: str | None = None,
    ) -> JourneyInstance:
        instance = await self._get_owned_instance(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=user_id,
        )
        if instance.status != self.ACTIVE:
            raise JosStateError("Only active journeys can be paused")

        instance.status = self.PAUSED
        instance.updated_at = datetime.now(timezone.utc)

        await self._record_event(
            instance.id,
            event_type="paused",
            from_step=instance.current_step_key,
            to_step=instance.current_step_key,
            payload={"status": self.PAUSED},
        )

        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def resume(
        self,
        instance_id: int,
        *,
        anonymous_session_id: str | None = None,
        user_id: str | None = None,
    ) -> JourneyInstance:
        instance = await self._get_owned_instance(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=user_id,
        )
        if instance.status != self.PAUSED:
            raise JosStateError("Only paused journeys can be resumed")

        instance.status = self.ACTIVE
        instance.updated_at = datetime.now(timezone.utc)

        await self._record_event(
            instance.id,
            event_type="resumed",
            from_step=instance.current_step_key,
            to_step=instance.current_step_key,
            payload={"status": self.ACTIVE},
        )

        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def complete(
        self,
        instance_id: int,
        *,
        anonymous_session_id: str | None = None,
        user_id: str | None = None,
    ) -> tuple[JourneyInstance, int | None]:
        instance = await self._get_owned_instance(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=user_id,
        )
        if instance.status == self.COMPLETED:
            existing_sr_id = await self._get_service_request_id(instance.id)
            return instance, existing_sr_id

        definition = await self._get_definition(instance.journey_definition_id)
        workflow = self._workflow_for_instance(instance, definition)
        from_step = instance.current_step_key
        step = get_step_definition(workflow, from_step)
        if step.get("terminal") is not True:
            raise JosStateError("Journey can only be completed from a terminal step")

        if instance.journey_type == BUILD_VILLA_JOURNEY_TYPE and not instance.context.get("intake_draft"):
            raise JosStateError("Build Villa intake draft must be assembled before completion")

        if instance.journey_type == ENGINEERING_CONSULTING_JOURNEY_TYPE and not instance.context.get("intake_draft"):
            raise JosStateError("Engineering Consulting intake draft must be assembled before completion")

        if instance.journey_type == CONTRACTING_JOURNEY_TYPE and not instance.context.get("intake_draft"):
            raise JosStateError("Contracting intake draft must be assembled before completion")

        if instance.journey_type == REAL_ESTATE_VALUATION_JOURNEY_TYPE and not instance.context.get(
            "intake_draft"
        ):
            raise JosStateError("Real Estate Valuation intake draft must be assembled before completion")

        if instance.journey_type == SMART_MAINTENANCE_JOURNEY_TYPE and not instance.context.get(
            "intake_draft"
        ):
            raise JosStateError("Smart Maintenance intake draft must be assembled before completion")

        if instance.journey_type == PROJECT_MANAGEMENT_JOURNEY_TYPE and not instance.context.get(
            "intake_draft"
        ):
            raise JosStateError("Project Management intake draft must be assembled before completion")

        if instance.journey_type == FURNISHING_JOURNEY_TYPE and not instance.context.get("intake_draft"):
            raise JosStateError("Furnishing intake draft must be assembled before completion")

        if instance.journey_type == FACILITY_MANAGEMENT_JOURNEY_TYPE and not instance.context.get("intake_draft"):
            raise JosStateError("Facility Management intake draft must be assembled before completion")

        if instance.journey_type == GOVERNMENT_SERVICES_JOURNEY_TYPE and not instance.context.get("intake_draft"):
            raise JosStateError("Government Services intake draft must be assembled before completion")

        if instance.journey_type == REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE and not instance.context.get("intake_draft"):
            raise JosStateError("Real Estate Development intake draft must be assembled before completion")

        if instance.journey_type == REAL_ESTATE_MARKETING_JOURNEY_TYPE and not instance.context.get("intake_draft"):
            raise JosStateError("Real Estate Marketing intake draft must be assembled before completion")

        instance.status = self.COMPLETED
        instance.completed_at = datetime.now(timezone.utc)
        instance.updated_at = datetime.now(timezone.utc)

        service_request_id: int | None = None
        try:
            if instance.user_id:
                sr_service = ServiceRequestService(self.db)
                service_request, created = await sr_service.create_from_journey(instance)
                service_request_id = service_request.id
                if created:
                    await self._record_event(
                        instance.id,
                        event_type="service_request_created",
                        from_step=from_step,
                        to_step=from_step,
                        payload={
                            "service_request_id": service_request.id,
                            "reference_code": service_request.reference_code,
                        },
                    )

            await self._record_event(
                instance.id,
                event_type="journey_completed",
                from_step=from_step,
                to_step=from_step,
                payload={"context": instance.context, "status": self.COMPLETED},
            )

            await self.db.commit()
            await self.db.refresh(instance)
            return instance, service_request_id
        except Exception:
            await self.db.rollback()
            raise

    async def record_event(
        self,
        instance_id: int,
        *,
        event_type: str,
        payload: dict[str, Any] | None = None,
        anonymous_session_id: str | None = None,
        user_id: str | None = None,
    ) -> JourneyEvent:
        instance = await self._get_owned_instance(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=user_id,
        )

        event = await self._record_event(
            instance.id,
            event_type=event_type,
            from_step=instance.current_step_key,
            to_step=instance.current_step_key,
            payload=payload or {},
        )

        await self.db.commit()
        await self.db.refresh(event)
        return event

    async def list_events(self, instance_id: int) -> list[JourneyEvent]:
        result = await self.db.execute(
            select(JourneyEvent)
            .where(JourneyEvent.journey_instance_id == instance_id)
            .order_by(JourneyEvent.id.asc())
        )
        return list(result.scalars().all())

    async def list_active_instances(
        self,
        *,
        journey_type: str | None = None,
        user_id: str | None = None,
        anonymous_session_id: str | None = None,
    ) -> list[JourneyInstance]:
        if not user_id and not anonymous_session_id:
            raise JosAccessError("Identity required to list active journey instances")

        ownership_filters = []
        if anonymous_session_id:
            ownership_filters.append(JourneyInstance.anonymous_session_id == anonymous_session_id)
        if user_id:
            ownership_filters.append(JourneyInstance.user_id == user_id)

        query = (
            select(JourneyInstance)
            .where(JourneyInstance.status.in_([self.ACTIVE, self.PAUSED]))
            .where(or_(*ownership_filters))
            .order_by(JourneyInstance.updated_at.desc())
        )
        if journey_type:
            query = query.where(JourneyInstance.journey_type == journey_type)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def attach_identity(
        self,
        instance_id: int,
        *,
        user_id: str,
        anonymous_session_id: str,
    ) -> tuple[JourneyInstance, int | None]:
        if not user_id:
            raise JosAccessError("Authentication required")
        if not anonymous_session_id:
            raise JosAccessError("Anonymous session header is required")

        instance = await self.get_instance(instance_id)
        if not instance:
            raise JourneyNotFoundError("Journey instance not found")

        if instance.anonymous_session_id != anonymous_session_id:
            raise JosAccessError("Journey instance access denied")

        if instance.user_id and instance.user_id != user_id:
            raise JosAccessError("Journey instance is already attached to another user")

        attached_now = False
        if not instance.user_id:
            instance.user_id = user_id
            instance.updated_at = datetime.now(timezone.utc)
            attached_now = True

        service_request_id: int | None = None
        try:
            if attached_now:
                await self._record_event(
                    instance.id,
                    event_type="identity_attached",
                    from_step=instance.current_step_key,
                    to_step=instance.current_step_key,
                    payload={"user_id": user_id, "anonymous_session_id": anonymous_session_id},
                )

            if instance.status == self.COMPLETED and instance.user_id:
                sr_service = ServiceRequestService(self.db)
                service_request, created = await sr_service.create_from_journey(instance)
                service_request_id = service_request.id
                if created:
                    await self._record_event(
                        instance.id,
                        event_type="service_request_created",
                        from_step=instance.current_step_key,
                        to_step=instance.current_step_key,
                        payload={
                            "service_request_id": service_request.id,
                            "reference_code": service_request.reference_code,
                        },
                    )
            elif instance.status == self.COMPLETED:
                service_request_id = await self._get_service_request_id(instance.id)

            await self.db.commit()
            await self.db.refresh(instance)
            return instance, service_request_id
        except Exception:
            await self.db.rollback()
            raise

    async def _find_active_instance(
        self,
        *,
        journey_type: str,
        user_id: str | None = None,
        anonymous_session_id: str | None = None,
    ) -> JourneyInstance | None:
        ownership_filters = []
        if anonymous_session_id:
            ownership_filters.append(JourneyInstance.anonymous_session_id == anonymous_session_id)
        if user_id:
            ownership_filters.append(JourneyInstance.user_id == user_id)
        if not ownership_filters:
            return None

        result = await self.db.execute(
            select(JourneyInstance)
            .where(
                JourneyInstance.journey_type == journey_type,
                JourneyInstance.status == self.ACTIVE,
                or_(*ownership_filters),
            )
            .order_by(JourneyInstance.updated_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    def _workflow_for_instance(
        self,
        instance: JourneyInstance,
        definition: JourneyDefinition,
    ) -> dict[str, Any]:
        context = instance.context or {}
        pinned = context.get(PINNED_WORKFLOW_CONTEXT_KEY)
        if isinstance(pinned, dict):
            return validate_workflow_definition(pinned)
        return validate_workflow_definition(definition.workflow_definition)

    async def _get_definition(self, definition_id: int) -> JourneyDefinition:
        result = await self.db.execute(
            select(JourneyDefinition).where(JourneyDefinition.id == definition_id)
        )
        definition = result.scalar_one_or_none()
        if not definition:
            raise JosStateError("Journey definition not found")
        return definition

    async def get_owned_instance(
        self,
        instance_id: int,
        *,
        anonymous_session_id: str | None = None,
        user_id: str | None = None,
    ) -> JourneyInstance:
        return await self._get_owned_instance(
            instance_id,
            anonymous_session_id=anonymous_session_id,
            user_id=user_id,
        )

    async def _get_owned_instance(
        self,
        instance_id: int,
        *,
        anonymous_session_id: str | None = None,
        user_id: str | None = None,
    ) -> JourneyInstance:
        instance = await self.get_instance(instance_id)
        if not instance:
            raise JourneyNotFoundError("Journey instance not found")

        if user_id and instance.user_id and instance.user_id == user_id:
            return instance

        if (
            anonymous_session_id
            and instance.anonymous_session_id
            and instance.anonymous_session_id == anonymous_session_id
        ):
            return instance

        if not instance.user_id and not instance.anonymous_session_id:
            return instance

        raise JosAccessError("Journey instance access denied")

    def _ensure_step_can_advance(
        self,
        instance: JourneyInstance,
        workflow: dict[str, Any],
        from_step: str,
    ) -> None:
        step = get_step_definition(workflow, from_step)
        if step.get("terminal") is True:
            raise JosStateError("Terminal steps are read-only and cannot be advanced")

        if instance.context.get("intake_draft") or instance.context.get("draft_status"):
            raise JosStateError("Journey intake draft is read-only; no further advance is allowed")

    async def _record_event(
        self,
        instance_id: int,
        *,
        event_type: str,
        from_step: str | None,
        to_step: str | None,
        payload: dict[str, Any] | None,
    ) -> JourneyEvent:
        event = JourneyEvent(
            journey_instance_id=instance_id,
            event_type=event_type,
            from_step=from_step,
            to_step=to_step,
            payload=payload or {},
        )
        self.db.add(event)
        await self.db.flush()
        return event

    async def _get_service_request_id(self, journey_instance_id: int) -> int | None:
        sr_service = ServiceRequestService(self.db)
        existing = await sr_service.get_by_journey_instance_id(journey_instance_id)
        return existing.id if existing else None
