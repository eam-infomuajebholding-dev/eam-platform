"""Build Villa backend closure tests (WO-006 STREAM B)."""

from __future__ import annotations

import copy

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.build_villa_validators import FieldValidationError
from services.jos import JosAccessError, JosDuplicateActiveJourneyError, JosService, JosStateError
from services.jos_validators import JourneyValidationError
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from services.build_villa_schema import BUILD_VILLA_STEP_ORDER
from tests.helpers.build_villa_flow import (
    BUILD_VILLA_V1_ADVANCE_SEQUENCE,
    advance_build_villa_v1_from_step,
    advance_build_villa_v1_to_step,
    advance_build_villa_v1_to_terminal,
)


@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        await upsert_journey_definition(
            session,
            {
                "journey_type": "build_villa",
                "name": "Build Villa Discovery",
                "description": "M1 discovery and intake journey for Build Villa.",
                "workflow_definition": BUILD_VILLA_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_bv_revisit_001_summary_reflects_edited_city(db_session: AsyncSession):
    """BV-REVISIT-001: revisit earlier step, edit, summary and brief reflect new value."""
    jos = JosService(db_session)
    session_id = "bv-revisit-001"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    instance = await advance_build_villa_v1_to_step(jos, instance.id, session_id, "summary_review")
    original_id = instance.id

    await jos.revisit_step(instance.id, "city", anonymous_session_id=session_id)
    instance = await jos.advance(
        instance.id,
        input_data={"city": "Dammam"},
        anonymous_session_id=session_id,
    )
    assert instance.current_step_key == "land_ownership"

    land_index = BUILD_VILLA_STEP_ORDER.index("land_ownership")
    instance = await advance_build_villa_v1_from_step(
        jos,
        instance.id,
        session_id,
        instance.current_step_key,
        payloads=BUILD_VILLA_V1_ADVANCE_SEQUENCE[land_index:],
    )
    assert instance.current_step_key == "intake_complete"
    assert instance.id == original_id
    assert instance.context["city"] == "Dammam"
    assert instance.context["preliminary_brief"]["location"]["city"] == "Dammam"


@pytest.mark.asyncio
async def test_bv_revisit_household_needs_updates_summary(db_session: AsyncSession):
    """WO-007 §09: revisit household_needs from summary_review and persist edited value."""
    jos = JosService(db_session)
    session_id = "bv-revisit-household"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    instance = await advance_build_villa_v1_to_step(jos, instance.id, session_id, "summary_review")

    await jos.revisit_step(instance.id, "household_needs", anonymous_session_id=session_id)
    instance = await jos.advance(
        instance.id,
        input_data={"household_size": 8, "use_summary": "عائلة كبيرة مع ضيوف متكررين"},
        anonymous_session_id=session_id,
    )
    space_index = BUILD_VILLA_STEP_ORDER.index("space_program")
    instance = await advance_build_villa_v1_from_step(
        jos,
        instance.id,
        session_id,
        instance.current_step_key,
        payloads=BUILD_VILLA_V1_ADVANCE_SEQUENCE[space_index:],
    )
    assert instance.context["household_size"] == 8
    assert "ضيوف متكررين" in instance.context["use_summary"]
    assert instance.context["preliminary_brief"]["household_summary"]["household_size"] == 8


@pytest.mark.asyncio
async def test_bv_revisit_cannot_jump_to_terminal(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "bv-revisit-block"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    with pytest.raises(JosStateError):
        await jos.revisit_step(instance.id, "intake_complete", anonymous_session_id=session_id)


@pytest.mark.parametrize(
    ("revisit_step", "payload", "assert_key", "assert_value"),
    [
        ("household_needs", {"household_size": 7, "use_summary": "أسرة موسعة"}, "household_size", 7),
        ("space_program", {"bedrooms": 6, "selected_spaces": ["kitchen", "parking"]}, "bedrooms", 6),
        ("timeline_context", {"desired_start": "asap", "urgency": "urgent"}, "desired_start", "asap"),
        ("design_direction", {"design_style": "modern"}, "design_style", "modern"),
        ("desired_service", {"desired_service": "design_only"}, "desired_service", "design_only"),
    ],
)
@pytest.mark.asyncio
async def test_bv_edit_edge_cases_regenerate_brief(
    db_session: AsyncSession,
    revisit_step: str,
    payload: dict,
    assert_key: str,
    assert_value,
):
    """WO-007 §12: downstream brief reflects edited domain values."""
    jos = JosService(db_session)
    session_id = f"bv-edit-{revisit_step}"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    instance = await advance_build_villa_v1_to_step(jos, instance.id, session_id, "brief_review")

    await jos.revisit_step(instance.id, revisit_step, anonymous_session_id=session_id)
    instance = await jos.advance(instance.id, input_data=payload, anonymous_session_id=session_id)
    instance = await advance_build_villa_v1_from_step(
        jos,
        instance.id,
        session_id,
        instance.current_step_key,
    )
    assert instance.context[assert_key] == assert_value
    assert instance.context.get("preliminary_brief") is not None


@pytest.mark.asyncio
async def test_bv_edit_001_budget_change_regenerates_brief(db_session: AsyncSession):
    """BV-EDIT-001: editing budget downstream regenerates preliminary brief."""
    jos = JosService(db_session)
    session_id = "bv-edit-budget"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    instance = await advance_build_villa_v1_to_step(jos, instance.id, session_id, "brief_review")
    first_brief = copy.deepcopy(instance.context["preliminary_brief"])

    await jos.revisit_step(instance.id, "budget_context", anonymous_session_id=session_id)
    instance = await jos.advance(
        instance.id,
        input_data={"budget_range": "5m_10m"},
        anonymous_session_id=session_id,
    )
    instance = await advance_build_villa_v1_from_step(
        jos,
        instance.id,
        session_id,
        instance.current_step_key,
    )
    second_brief = instance.context["preliminary_brief"]
    assert second_brief["budget_context"]["budget_range"] == "5m_10m"
    assert first_brief["budget_context"]["budget_range"] != "5m_10m"


@pytest.mark.asyncio
async def test_bv_submit_001_scope_alone_does_not_complete(db_session: AsyncSession):
    """BV-SUBMIT-001: scope_confirm alone does not reach terminal or create SR."""
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    session_id = "bv-submit-001"
    user_id = "bv-submit-user"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    payloads_through_brief = BUILD_VILLA_V1_ADVANCE_SEQUENCE[:-2]
    for payload in payloads_through_brief:
        instance = await jos.advance(instance.id, input_data=payload, anonymous_session_id=session_id)

    assert instance.current_step_key == "scope_confirm"

    instance = await jos.advance(
        instance.id,
        input_data={"scope_confirmed": True},
        anonymous_session_id=session_id,
    )
    assert instance.current_step_key == "submit_confirm"
    assert instance.status == "active"

    with pytest.raises(FieldValidationError):
        await jos.advance(instance.id, input_data={"submit_confirmed": False}, anonymous_session_id=session_id)

    with pytest.raises(JourneyValidationError):
        await jos.advance(instance.id, input_data={}, anonymous_session_id=session_id)

    assert await sr_service.get_by_journey_instance_id(instance.id) is None


@pytest.mark.asyncio
async def test_bv_idempotency_edge_001_exactly_one_sr(db_session: AsyncSession):
    """BV-IDEMPOTENCY-EDGE-001: double complete and attach produce exactly one SR."""
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    session_id = "bv-idem-001"
    user_id = "bv-idem-user"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)

    completed, sr_id_1 = await jos.complete(instance.id, anonymous_session_id=session_id)
    assert sr_id_1 is None

    attached, sr_id_2 = await jos.attach_identity(
        instance.id,
        user_id=user_id,
        anonymous_session_id=session_id,
    )
    assert attached.user_id == user_id
    assert sr_id_2 is not None

    _, sr_id_3 = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert sr_id_3 == sr_id_2

    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.id == sr_id_2
    assert sr.intake_snapshot["city"] == "Jeddah"
    assert sr.intake_snapshot.get("preliminary_brief") is not None


@pytest.mark.asyncio
async def test_bv_snapshot_immutable_after_sr_creation(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    session_id = "bv-snapshot"
    user_id = "bv-snapshot-user"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)

    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    original_city = sr.intake_snapshot["city"]

    instance.context["city"] = "ChangedCity"
    await db_session.commit()

    refreshed = await sr_service.get_by_journey_instance_id(instance.id)
    assert refreshed is not None
    assert refreshed.intake_snapshot["city"] == original_city


@pytest.mark.asyncio
async def test_bv_revisit_cross_user_denied(db_session: AsyncSession):
    jos = JosService(db_session)
    owner_session = "owner-session"
    instance = await jos.start_journey("build_villa", anonymous_session_id=owner_session)
    with pytest.raises(JosAccessError):
        await jos.revisit_step(instance.id, "city", anonymous_session_id="other-session")


def test_bv_canonical_step_order_matches_schema():
    workflow_keys = [step["key"] for step in BUILD_VILLA_WORKFLOW["steps"]]
    assert workflow_keys == BUILD_VILLA_STEP_ORDER


@pytest.mark.asyncio
async def test_bv_duplicate_active_guard(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "bv-dup-guard"
    await jos.start_journey("build_villa", anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey("build_villa", anonymous_session_id=session_id)
