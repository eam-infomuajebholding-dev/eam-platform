"""Real Estate Development journey (#01) backend tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import REAL_ESTATE_DEVELOPMENT_WORKFLOW, upsert_journey_definition
from services.real_estate_development_validators import (
    REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
    assemble_development_opportunity_snapshot,
)
from services.service_requests import ServiceRequestService
from tests.helpers.real_estate_development_flow import advance_real_estate_development_v1_to_terminal


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
                "journey_type": REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
                "name": "Real Estate Development Intake",
                "description": "Test",
                "workflow_definition": REAL_ESTATE_DEVELOPMENT_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_real_estate_development_workflow_starts_at_asset_context(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(
        REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
        anonymous_session_id="red-anon-1",
    )
    assert instance.current_step_key == "asset_context"


@pytest.mark.asyncio
async def test_development_opportunity_snapshot_is_preliminary(db_session: AsyncSession):
    context = {
        "asset_context": "owned_land",
        "asset_location": "جدة",
        "development_objective": "استكشاف تطوير أرض سكنية",
        "intended_use": "residential",
        "current_status": "vacant_land",
        "documents_readiness": "none",
        "target_timeline": "6 أشهر",
        "urgency": "standard",
    }
    brief = assemble_development_opportunity_snapshot(context)
    assert brief["status"] == "PRELIMINARY"
    assert brief["type"] == "PRELIMINARY_DEVELOPMENT_OPPORTUNITY_SNAPSHOT"
    assert "جدوى" in brief["regulatory_disclaimer"]
    assert len(brief["diligence_checklist"]) >= 3


@pytest.mark.asyncio
async def test_real_estate_development_full_path_creates_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "red-user-1"
    session_id = "red-session-1"
    instance = await jos.start_journey(
        REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_real_estate_development_v1_to_terminal(jos, instance.id, session_id)
    completed, sr_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None

    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.reference_code.startswith("RD-")
    assert sr.intake_snapshot.get("journey_type") == REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE
    assert sr.intake_snapshot.get("preliminary_brief", {}).get("status") == "PRELIMINARY"


@pytest.mark.asyncio
async def test_duplicate_active_real_estate_development_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "red-dup-session"
    await jos.start_journey(REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE, anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE, anonymous_session_id=session_id)
