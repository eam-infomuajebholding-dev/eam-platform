"""Smart Maintenance journey (#13) backend tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import SMART_MAINTENANCE_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from services.smart_maintenance_validators import (
    SMART_MAINTENANCE_JOURNEY_TYPE,
    assemble_maintenance_readiness_brief,
)
from tests.helpers.maintenance_flow import advance_smart_maintenance_v1_to_terminal


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
                "journey_type": SMART_MAINTENANCE_JOURNEY_TYPE,
                "name": "Smart Maintenance Readiness Intake",
                "description": "Test",
                "workflow_definition": SMART_MAINTENANCE_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_smart_maintenance_workflow_starts_at_maintenance_category(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(SMART_MAINTENANCE_JOURNEY_TYPE, anonymous_session_id="sm-anon-1")
    assert instance.current_step_key == "maintenance_category"


@pytest.mark.asyncio
async def test_smart_maintenance_readiness_brief_generated(db_session: AsyncSession):
    context = {
        "issue_description": "عطل تكييف مركزي",
        "maintenance_category": "hvac",
        "access_readiness": "restricted",
        "severity_level": "critical",
        "engagement_goal": "preventive_plan",
    }
    brief = assemble_maintenance_readiness_brief(context)
    assert brief["status"] == "PRELIMINARY"
    assert brief["professional_review_required"] is True
    assert brief["title"] == "موجز جاهزية الصيانة الذكية"
    assert any("الوصول" in item for item in brief["missing_information"])


@pytest.mark.asyncio
async def test_smart_maintenance_full_path_creates_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "sm-user-1"
    session_id = "sm-session-1"
    instance = await jos.start_journey(
        SMART_MAINTENANCE_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_smart_maintenance_v1_to_terminal(jos, instance.id, session_id)
    completed, sr_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.reference_code.startswith("SM-")
    assert sr.intake_snapshot.get("preliminary_brief", {}).get("title")


@pytest.mark.asyncio
async def test_duplicate_active_smart_maintenance_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "sm-dup"
    await jos.start_journey(SMART_MAINTENANCE_JOURNEY_TYPE, anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(SMART_MAINTENANCE_JOURNEY_TYPE, anonymous_session_id=session_id)
