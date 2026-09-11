"""Real Estate Valuation journey (#05) backend tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import REAL_ESTATE_VALUATION_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from services.build_villa_validators import FieldValidationError
from services.valuation_validators import (
    REAL_ESTATE_VALUATION_JOURNEY_TYPE,
    assemble_valuation_readiness_brief,
)
from tests.helpers.valuation_flow import advance_valuation_v1_to_terminal


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
                "journey_type": REAL_ESTATE_VALUATION_JOURNEY_TYPE,
                "name": "Real Estate Valuation Readiness Intake",
                "description": "Test",
                "workflow_definition": REAL_ESTATE_VALUATION_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_valuation_workflow_starts_at_valuation_purpose(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(REAL_ESTATE_VALUATION_JOURNEY_TYPE, anonymous_session_id="rv-anon-1")
    assert instance.current_step_key == "valuation_purpose"


@pytest.mark.asyncio
async def test_valuation_readiness_brief_generated(db_session: AsyncSession):
    context = {
        "asset_description": "فيلا سكنية",
        "valuation_purpose": "mortgage",
        "inspection_readiness": "unknown",
        "engagement_goal": "formal_valuation",
        "deed_available": False,
        "title_docs_available": False,
        "plans_available": False,
    }
    brief = assemble_valuation_readiness_brief(context)
    assert brief["status"] == "PRELIMINARY"
    assert brief["professional_review_required"] is True
    assert brief["title"] == "موجز جاهزية التقييم العقاري"
    assert any("ملكية" in item for item in brief["missing_information"])


@pytest.mark.asyncio
async def test_valuation_invalid_asset_description_rejected(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(REAL_ESTATE_VALUATION_JOURNEY_TYPE, anonymous_session_id="rv-invalid")
    await jos.advance(instance.id, input_data={"valuation_purpose": "sale"}, anonymous_session_id="rv-invalid")
    await jos.advance(instance.id, input_data={"asset_type": "villa"}, anonymous_session_id="rv-invalid")
    await jos.advance(instance.id, input_data={"location": "الرياض"}, anonymous_session_id="rv-invalid")
    with pytest.raises(FieldValidationError):
        await jos.advance(
            instance.id,
            input_data={"asset_description": "قصير"},
            anonymous_session_id="rv-invalid",
        )


@pytest.mark.asyncio
async def test_valuation_full_path_creates_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "rv-user-1"
    session_id = "rv-session-1"
    instance = await jos.start_journey(
        REAL_ESTATE_VALUATION_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_valuation_v1_to_terminal(jos, instance.id, session_id)
    completed, sr_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.reference_code.startswith("RV-")
    assert sr.intake_snapshot.get("preliminary_brief", {}).get("title")


@pytest.mark.asyncio
async def test_duplicate_active_valuation_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "rv-dup"
    await jos.start_journey(REAL_ESTATE_VALUATION_JOURNEY_TYPE, anonymous_session_id=session_id)
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(REAL_ESTATE_VALUATION_JOURNEY_TYPE, anonymous_session_id=session_id)
