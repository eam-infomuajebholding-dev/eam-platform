"""Contracting journey (#09) backend tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.contracting_validators import CONTRACTING_JOURNEY_TYPE, assemble_contracting_readiness_brief
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import CONTRACTING_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from tests.helpers.contracting_flow import advance_contracting_v1_to_terminal


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
                "journey_type": CONTRACTING_JOURNEY_TYPE,
                "name": "Contracting Readiness Intake",
                "description": "Test",
                "workflow_definition": CONTRACTING_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_contracting_workflow_starts_at_project_context(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(CONTRACTING_JOURNEY_TYPE, anonymous_session_id="ct-anon-1")
    assert instance.current_step_key == "project_context"


@pytest.mark.asyncio
async def test_contracting_readiness_brief_generated(db_session: AsyncSession):
    context = {
        "project_description": "مشروع تنفيذ",
        "design_readiness": "concept_only",
        "boq_readiness": "not_available",
        "site_readiness": "not_ready",
        "procurement_goal": "contractor_sourcing",
    }
    brief = assemble_contracting_readiness_brief(context)
    assert brief["status"] == "PRELIMINARY"
    assert brief["professional_review_required"] is True
    assert any("BOQ" in item for item in brief["missing_information"])


@pytest.mark.asyncio
async def test_contracting_full_path_creates_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "ct-user-1"
    session_id = "ct-session-1"
    instance = await jos.start_journey(
        CONTRACTING_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_contracting_v1_to_terminal(jos, instance.id, session_id)
    completed, sr_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.reference_code.startswith("CT-")
    assert sr.intake_snapshot.get("preliminary_brief", {}).get("title")


@pytest.mark.asyncio
async def test_duplicate_active_contracting_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "ct-dup"
    await jos.start_journey(CONTRACTING_JOURNEY_TYPE, anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(CONTRACTING_JOURNEY_TYPE, anonymous_session_id=session_id)
