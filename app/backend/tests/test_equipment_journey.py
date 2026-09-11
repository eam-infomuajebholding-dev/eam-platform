"""Equipment journey (#11) backend tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.equipment_validators import EQUIPMENT_JOURNEY_TYPE, assemble_equipment_readiness_brief
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import EQUIPMENT_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from tests.helpers.equipment_flow import advance_equipment_v1_to_terminal


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
                "journey_type": EQUIPMENT_JOURNEY_TYPE,
                "name": "Equipment Intake",
                "description": "Test",
                "workflow_definition": EQUIPMENT_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_equipment_workflow_starts_at_equipment_need(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(
        EQUIPMENT_JOURNEY_TYPE,
        anonymous_session_id="eq-anon-1",
    )
    assert instance.current_step_key == "equipment_need"


@pytest.mark.asyncio
async def test_equipment_readiness_brief_is_preliminary(db_session: AsyncSession):
    context = {
        "equipment_need": "rental",
        "equipment_category": "heavy_machinery",
        "usage_context": "معدات ثقيلة",
        "location": "جدة",
        "engagement_type": "rent",
        "target_timeline": "شهر",
        "urgency": "standard",
    }
    brief = assemble_equipment_readiness_brief(context)
    assert brief["status"] == "PRELIMINARY"
    assert brief["type"] == "PRELIMINARY_EQUIPMENT_READINESS_BRIEF"
    assert "عرض سعر" in brief["regulatory_disclaimer"]


@pytest.mark.asyncio
async def test_equipment_full_path_creates_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "eq-user-1"
    session_id = "eq-session-1"
    instance = await jos.start_journey(
        EQUIPMENT_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_equipment_v1_to_terminal(jos, instance.id, session_id)
    completed, sr_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None

    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.reference_code.startswith("EQ-")
    assert sr.intake_snapshot.get("journey_type") == EQUIPMENT_JOURNEY_TYPE
    assert sr.intake_snapshot.get("preliminary_brief", {}).get("status") == "PRELIMINARY"


@pytest.mark.asyncio
async def test_duplicate_active_equipment_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "eq-dup-session"
    await jos.start_journey(EQUIPMENT_JOURNEY_TYPE, anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(EQUIPMENT_JOURNEY_TYPE, anonymous_session_id=session_id)
