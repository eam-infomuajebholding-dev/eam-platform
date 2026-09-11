"""Building Materials journey (#10) backend tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.building_materials_validators import (
    BUILDING_MATERIALS_JOURNEY_TYPE,
    assemble_procurement_readiness_brief,
)
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import BUILDING_MATERIALS_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from tests.helpers.building_materials_flow import advance_building_materials_v1_to_terminal


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
                "journey_type": BUILDING_MATERIALS_JOURNEY_TYPE,
                "name": "Building Materials Intake",
                "description": "Test",
                "workflow_definition": BUILDING_MATERIALS_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_building_materials_workflow_starts_at_procurement_goal(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(
        BUILDING_MATERIALS_JOURNEY_TYPE,
        anonymous_session_id="bm-anon-1",
    )
    assert instance.current_step_key == "procurement_goal"


@pytest.mark.asyncio
async def test_procurement_readiness_brief_is_preliminary(db_session: AsyncSession):
    context = {
        "procurement_goal": "project_supply",
        "material_category": "structural",
        "project_context": "توريد مواد",
        "delivery_location": "الرياض",
        "quantity_scope": "medium",
        "target_timeline": "شهر",
        "urgency": "standard",
    }
    brief = assemble_procurement_readiness_brief(context)
    assert brief["status"] == "PRELIMINARY"
    assert brief["type"] == "PRELIMINARY_BUILDING_MATERIALS_PROCUREMENT_BRIEF"
    assert "عرض سعر" in brief["regulatory_disclaimer"]


@pytest.mark.asyncio
async def test_building_materials_full_path_creates_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "bm-user-1"
    session_id = "bm-session-1"
    instance = await jos.start_journey(
        BUILDING_MATERIALS_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_building_materials_v1_to_terminal(jos, instance.id, session_id)
    completed, sr_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None

    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.reference_code.startswith("BM-")
    assert sr.intake_snapshot.get("journey_type") == BUILDING_MATERIALS_JOURNEY_TYPE
    assert sr.intake_snapshot.get("preliminary_brief", {}).get("status") == "PRELIMINARY"


@pytest.mark.asyncio
async def test_duplicate_active_building_materials_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "bm-dup-session"
    await jos.start_journey(BUILDING_MATERIALS_JOURNEY_TYPE, anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(BUILDING_MATERIALS_JOURNEY_TYPE, anonymous_session_id=session_id)
