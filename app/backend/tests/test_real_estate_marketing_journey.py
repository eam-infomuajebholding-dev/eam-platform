"""Real Estate Marketing journey (#02) backend tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import REAL_ESTATE_MARKETING_WORKFLOW, upsert_journey_definition
from services.real_estate_marketing_validators import (
    REAL_ESTATE_MARKETING_JOURNEY_TYPE,
    assemble_marketing_readiness_brief,
)
from services.service_requests import ServiceRequestService
from tests.helpers.real_estate_marketing_flow import advance_real_estate_marketing_v1_to_terminal


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
                "journey_type": REAL_ESTATE_MARKETING_JOURNEY_TYPE,
                "name": "Real Estate Marketing Intake",
                "description": "Test",
                "workflow_definition": REAL_ESTATE_MARKETING_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_real_estate_marketing_workflow_starts_at_marketing_goal(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(
        REAL_ESTATE_MARKETING_JOURNEY_TYPE,
        anonymous_session_id="rm-anon-1",
    )
    assert instance.current_step_key == "marketing_goal"


@pytest.mark.asyncio
async def test_marketing_readiness_brief_is_preliminary(db_session: AsyncSession):
    context = {
        "marketing_goal": "sell_property",
        "property_description": "فيلا للبيع",
        "property_location": "جدة",
        "target_audience": "end_buyers",
        "marketing_stage": "planning",
        "existing_assets": "none",
        "target_timeline": "شهرين",
        "urgency": "standard",
    }
    brief = assemble_marketing_readiness_brief(context)
    assert brief["status"] == "PRELIMINARY"
    assert brief["type"] == "PRELIMINARY_REAL_ESTATE_MARKETING_READINESS_BRIEF"
    assert "ROI" in brief["regulatory_disclaimer"] or "leads" in brief["regulatory_disclaimer"]


@pytest.mark.asyncio
async def test_real_estate_marketing_full_path_creates_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "rm-user-1"
    session_id = "rm-session-1"
    instance = await jos.start_journey(
        REAL_ESTATE_MARKETING_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_real_estate_marketing_v1_to_terminal(jos, instance.id, session_id)
    completed, sr_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None

    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.reference_code.startswith("RM-")
    assert sr.intake_snapshot.get("journey_type") == REAL_ESTATE_MARKETING_JOURNEY_TYPE
    assert sr.intake_snapshot.get("preliminary_brief", {}).get("status") == "PRELIMINARY"


@pytest.mark.asyncio
async def test_duplicate_active_real_estate_marketing_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "rm-dup-session"
    await jos.start_journey(REAL_ESTATE_MARKETING_JOURNEY_TYPE, anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(REAL_ESTATE_MARKETING_JOURNEY_TYPE, anonymous_session_id=session_id)
