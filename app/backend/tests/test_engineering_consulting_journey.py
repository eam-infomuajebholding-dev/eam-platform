"""Tests for Engineering Consulting journey (Pilot #08)."""

from __future__ import annotations

import os

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.auth import create_access_token
from core.database import Base
from services.engineering_consulting_validators import FieldValidationError, validate_engineering_consulting_step
from services.jos import JosService, JosStateError
from services.jos_seed import ENGINEERING_CONSULTING_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService


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
                "journey_type": "engineering_consulting",
                "name": "Engineering Consulting Intake",
                "description": "Pilot #08",
                "workflow_definition": ENGINEERING_CONSULTING_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


def test_intent_requires_problem_statement():
    with pytest.raises(FieldValidationError):
        validate_engineering_consulting_step("intent", {"problem_statement": "short"})


def test_discipline_enum():
    assert validate_engineering_consulting_step("discipline", {"discipline": "architectural"}) == {
        "discipline": "architectural"
    }


@pytest.mark.asyncio
async def test_full_engineering_consulting_journey_anonymous(db_session: AsyncSession):
    service = JosService(db_session)
    session_id = "ec-anon-session"

    instance = await service.start_journey("engineering_consulting", anonymous_session_id=session_id)
    assert instance.current_step_key == "intent"

    instance = await service.advance(
        instance.id,
        input_data={"problem_statement": "أحتاج مراجعة تصميم معماري لمبنى تجاري", "desired_outcome": "توصية أولية"},
        anonymous_session_id=session_id,
    )
    assert instance.current_step_key == "discipline"

    instance = await service.advance(
        instance.id,
        input_data={"discipline": "architectural"},
        anonymous_session_id=session_id,
    )
    instance = await service.advance(
        instance.id,
        input_data={
            "project_type": "new_build",
            "location": "الرياض",
            "objective": "تطوير مبنى تجاري متوسط",
            "urgency": "standard",
        },
        anonymous_session_id=session_id,
    )
    instance = await service.advance(instance.id, input_data={}, anonymous_session_id=session_id)
    assert instance.current_step_key == "brief_review"
    assert instance.context.get("preliminary_brief")
    assert instance.context["preliminary_brief"]["status"] == "PRELIMINARY"

    instance = await service.advance(instance.id, input_data={}, anonymous_session_id=session_id)
    assert instance.current_step_key == "scope_confirm"

    instance = await service.advance(
        instance.id,
        input_data={"scope_confirmed": True},
        anonymous_session_id=session_id,
    )
    assert instance.current_step_key == "handoff_complete"
    assert instance.context.get("intake_draft")

    completed, sr_id = await service.complete(instance.id, anonymous_session_id=session_id)
    assert completed.status == "completed"
    assert sr_id is None


@pytest.mark.asyncio
async def test_service_request_idempotency_for_engineering_consulting(db_session: AsyncSession, monkeypatch):
    monkeypatch.setenv("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "test-jwt-secret"))
    service = JosService(db_session)
    user_id = "ec-user-1"
    session_id = "ec-auth-session"

    instance = await service.start_journey(
        "engineering_consulting",
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    for step_input in [
        {"problem_statement": "مراجعة تصميم إنشائي لمشروع سكني"},
        {"discipline": "civil_structural"},
        {"project_type": "renovation", "location": "جدة", "objective": "تقوية وترميم"},
        {},
        {},
        {"scope_confirmed": True},
    ]:
        instance = await service.advance(
            instance.id,
            input_data=step_input,
            anonymous_session_id=session_id,
            user_id=user_id,
        )

    completed, sr_id = await service.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None

    completed_again, sr_id_again = await service.complete(
        instance.id, anonymous_session_id=session_id, user_id=user_id
    )
    assert sr_id_again == sr_id

    sr_service = ServiceRequestService(db_session)
    existing = await sr_service.get_by_journey_instance_id(instance.id)
    assert existing is not None
    assert existing.request_type == "engineering_consulting_intake"
    assert existing.intake_snapshot.get("preliminary_brief")
