"""Government Services journey (#06) backend tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.government_services_validators import (
    GOVERNMENT_SERVICES_JOURNEY_TYPE,
    assemble_government_services_task_roadmap,
)
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import GOVERNMENT_SERVICES_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from tests.helpers.government_services_flow import advance_government_services_v1_to_terminal


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
                "journey_type": GOVERNMENT_SERVICES_JOURNEY_TYPE,
                "name": "Government Services Intake",
                "description": "Test",
                "workflow_definition": GOVERNMENT_SERVICES_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_government_services_workflow_starts_at_service_category(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(GOVERNMENT_SERVICES_JOURNEY_TYPE, anonymous_session_id="gs-anon-1")
    assert instance.current_step_key == "service_category"


@pytest.mark.asyncio
async def test_government_services_task_roadmap_is_preliminary(db_session: AsyncSession):
    context = {
        "service_category": "building_permit",
        "property_location": "جدة",
        "property_type": "commercial",
        "request_summary": "رخصة بناء تجاري",
        "documents_status": "none",
        "urgency": "standard",
    }
    brief = assemble_government_services_task_roadmap(context)
    assert brief["status"] == "PRELIMINARY"
    assert "التحقق" in brief["regulatory_disclaimer"]
    assert brief["preliminary_roadmap"][1]["status"] == "REQUIREMENT_TO_VERIFY"
    assert len(brief["preliminary_roadmap"]) >= 3


@pytest.mark.asyncio
async def test_government_services_full_path_creates_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "gs-user-1"
    session_id = "gs-session-1"
    instance = await jos.start_journey(
        GOVERNMENT_SERVICES_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_government_services_v1_to_terminal(jos, instance.id, session_id)
    completed, sr_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.reference_code.startswith("GS-")
    assert sr.intake_snapshot.get("preliminary_brief", {}).get("title")


@pytest.mark.asyncio
async def test_duplicate_active_government_services_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "gs-dup"
    await jos.start_journey(GOVERNMENT_SERVICES_JOURNEY_TYPE, anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(GOVERNMENT_SERVICES_JOURNEY_TYPE, anonymous_session_id=session_id)
