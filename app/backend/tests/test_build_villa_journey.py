"""Tests for Build Villa discovery journey (WO-003)."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from models.journey_definitions import JourneyDefinition
from services.build_villa_validators import FieldValidationError, validate_build_villa_step
from services.jos import JosService, JosStateError
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from tests.helpers.build_villa_flow import BUILD_VILLA_V1_ADVANCE_SEQUENCE


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


def test_city_validation_rules():
    assert validate_build_villa_step("city", {"city": "  Riyadh  "}) == {"city": "Riyadh"}

    with pytest.raises(FieldValidationError) as exc:
        validate_build_villa_step("city", {"city": " "})
    assert exc.value.errors[0]["field"] == "city"

    with pytest.raises(FieldValidationError) as exc:
        validate_build_villa_step("city", {"city": "x" * 101})
    assert exc.value.errors[0]["code"] == "too_long"


def test_land_ownership_enum():
    result = validate_build_villa_step("land_ownership", {"land_ownership_type": "owned"})
    assert result == {"land_ownership_type": "owned"}

    with pytest.raises(FieldValidationError) as exc:
        validate_build_villa_step("land_ownership", {"land_ownership_type": "rented"})
    assert exc.value.errors[0]["field"] == "land_ownership_type"


def test_land_area_validation():
    assert validate_build_villa_step("land_area", {"land_area_sqm": 500}) == {"land_area_sqm": 500.0}

    with pytest.raises(FieldValidationError):
        validate_build_villa_step("land_area", {"land_area_sqm": 0})

    with pytest.raises(FieldValidationError):
        validate_build_villa_step("land_area", {"land_area_sqm": 100001})


def test_documents_context_optional():
    assert validate_build_villa_step("documents_context", {}) == {}

    result = validate_build_villa_step(
        "documents_context",
        {
            "has_documents": False,
            "document_notes": "No documents yet",
            "document_refs": [{"label": "Plot plan", "url": "https://example.com/plan.pdf"}],
        },
    )
    assert result["has_documents"] is False
    assert result["document_notes"] == "No documents yet"
    assert len(result["document_refs"]) == 1


def test_scope_confirm_requires_true():
    with pytest.raises(FieldValidationError) as exc:
        validate_build_villa_step("scope_confirm", {"scope_confirmed": False})
    assert exc.value.errors[0]["field"] == "scope_confirmed"

    assert validate_build_villa_step("scope_confirm", {"scope_confirmed": True}) == {
        "scope_confirmed": True
    }


def test_invalid_document_url():
    with pytest.raises(FieldValidationError) as exc:
        validate_build_villa_step(
            "documents_context",
            {"document_refs": [{"label": "Bad link", "url": "not-a-url"}]},
        )
    assert "url" in exc.value.errors[0]["field"]


@pytest.mark.asyncio
async def test_full_build_villa_journey(db_session: AsyncSession):
    service = JosService(db_session)
    session_id = "test-anon-session"

    instance = await service.start_journey(
        "build_villa",
        anonymous_session_id=session_id,
    )
    assert instance.current_step_key == "project_intent"

    for payload in BUILD_VILLA_V1_ADVANCE_SEQUENCE:
        instance = await service.advance(instance.id, input_data=payload, anonymous_session_id=session_id)

    assert instance.current_step_key == "intake_complete"
    assert instance.context["draft_status"] == "ready_for_handoff"
    assert instance.context["intake_draft"]["city"] == "Jeddah"
    assert instance.context["intake_draft"]["desired_service"] == "full_service"
    assert instance.context["intake_draft"]["preliminary_brief"]["status"] == "PRELIMINARY"
    assert instance.context["intake_draft"]["scope_confirmed"] is True
    assert instance.context["intake_draft"]["submit_confirmed"] is True
    assert instance.context.get("preliminary_brief")

    with pytest.raises(JosStateError):
        await service.advance(instance.id, input_data={"city": "Jeddah"}, anonymous_session_id=session_id)

    completed, _ = await service.complete(instance.id, anonymous_session_id=session_id)
    assert completed.status == "completed"

    events = await service.list_events(instance.id)
    event_types = [event.event_type for event in events]
    assert "journey_started" in event_types
    assert "step_advanced" in event_types
    assert "preliminary_brief_generated" in event_types
    assert "intake_draft_assembled" in event_types
    assert "journey_completed" in event_types


@pytest.mark.asyncio
async def test_validation_failed_event(db_session: AsyncSession):
    service = JosService(db_session)
    session_id = "validation-session"

    instance = await service.start_journey("build_villa", anonymous_session_id=session_id)

    with pytest.raises(FieldValidationError):
        await service.advance(instance.id, input_data={"project_objective": "short"}, anonymous_session_id=session_id)

    events = await service.list_events(instance.id)
    assert any(event.event_type == "validation_failed" for event in events)


@pytest.mark.asyncio
async def test_build_villa_definition_upsert(db_session: AsyncSession):
    from sqlalchemy import select

    result = await db_session.execute(
        select(JourneyDefinition).where(JourneyDefinition.journey_type == "build_villa")
    )
    definition = result.scalar_one()
    assert definition.workflow_definition["initial_step"] == "project_intent"
    assert definition.name == "Build Villa Discovery"

    await upsert_journey_definition(
        db_session,
        {
            "journey_type": "build_villa",
            "name": "Build Villa Discovery Updated",
            "description": "Updated",
            "workflow_definition": BUILD_VILLA_WORKFLOW,
        },
    )
    await db_session.commit()
    await db_session.refresh(definition)
    assert definition.name == "Build Villa Discovery Updated"
