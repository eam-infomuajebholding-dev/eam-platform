"""Furnishing journey (#15) backend tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.furnishing_validators import (
    FURNISHING_JOURNEY_TYPE,
    assemble_furnishing_readiness_brief,
)
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import FURNISHING_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from tests.helpers.furnishing_flow import advance_furnishing_v1_to_terminal


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
                "journey_type": FURNISHING_JOURNEY_TYPE,
                "name": "Furnishing Readiness Intake",
                "description": "Test",
                "workflow_definition": FURNISHING_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_furnishing_workflow_starts_at_space_type(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(FURNISHING_JOURNEY_TYPE, anonymous_session_id="fr-anon-1")
    assert instance.current_step_key == "space_type"


@pytest.mark.asyncio
async def test_furnishing_readiness_brief_generated(db_session: AsyncSession):
    context = {
        "functional_priorities": "تأثيث فيلا عائلية",
        "style_direction": "undecided",
        "budget_range": "not_defined",
        "room_scope": "غرف نوم",
    }
    brief = assemble_furnishing_readiness_brief(context)
    assert brief["status"] == "PRELIMINARY"
    assert brief["title"] == "موجز جاهزية التأثيث والتجهيز"
    assert len(brief["missing_information"]) >= 1


@pytest.mark.asyncio
async def test_furnishing_full_path_creates_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "fr-user-1"
    session_id = "fr-session-1"
    instance = await jos.start_journey(
        FURNISHING_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_furnishing_v1_to_terminal(jos, instance.id, session_id)
    completed, sr_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.reference_code.startswith("FR-")
    assert sr.intake_snapshot.get("preliminary_brief", {}).get("title")


@pytest.mark.asyncio
async def test_duplicate_active_furnishing_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "fr-dup"
    await jos.start_journey(FURNISHING_JOURNEY_TYPE, anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(FURNISHING_JOURNEY_TYPE, anonymous_session_id=session_id)
