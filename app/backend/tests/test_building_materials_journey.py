"""Building Materials journey (#10) backend tests."""

from __future__ import annotations

import os

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.building_materials_legal_terms import BUYER_LIABILITY_TERMS_VERSION
from services.building_materials_validators import (
    BUILDING_MATERIALS_JOURNEY_TYPE,
    assemble_procurement_invoice,
    validate_building_materials_step,
)
from services.build_villa_validators import FieldValidationError
from services.jos import JosDuplicateActiveJourneyError, JosService
from services.jos_seed import BUILDING_MATERIALS_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from tests.helpers.building_materials_flow import advance_building_materials_v2_to_terminal


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
async def test_building_materials_workflow_starts_at_materials_intake(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(
        BUILDING_MATERIALS_JOURNEY_TYPE,
        anonymous_session_id="bm-anon-1",
    )
    assert instance.current_step_key == "materials_intake"


@pytest.mark.asyncio
async def test_procurement_invoice_from_materials_list(db_session: AsyncSession):
    context = {
        "materials_list": "أسمنت 10 كيس\nبلك 1000 قطعة",
        "delivery_location": "جدة",
        "requester_name": "سارة",
        "requester_phone": "+966512345678",
    }
    invoice = assemble_procurement_invoice(context)
    assert invoice["status"] == "PROVISIONAL"
    assert len(invoice["line_items"]) >= 2
    assert invoice["total_amount"] is not None
    terms = invoice["buyer_liability_terms"]
    assert terms["version"] == BUYER_LIABILITY_TERMS_VERSION
    assert len(terms["clauses"]) >= 5


def test_invoice_confirm_requires_liability_terms_acceptance():
    with pytest.raises(FieldValidationError):
        validate_building_materials_step("invoice_confirm", {"invoice_confirmed": True})
    result = validate_building_materials_step(
        "invoice_confirm",
        {"invoice_confirmed": True, "buyer_liability_terms_accepted": True},
    )
    assert result["buyer_liability_terms_version"] == BUYER_LIABILITY_TERMS_VERSION


@pytest.mark.asyncio
async def test_building_materials_full_path_creates_service_request(db_session: AsyncSession):
    os.environ["JOURNEY_DEV_OTP"] = "123456"
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "bm-user-1"
    session_id = "bm-session-1"
    instance = await jos.start_journey(
        BUILDING_MATERIALS_JOURNEY_TYPE,
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    await advance_building_materials_v2_to_terminal(jos, instance.id, session_id)
    instance = await jos.get_instance(instance.id)
    assert instance is not None
    assert instance.current_step_key == "intake_complete"
    assert instance.context.get("procurement_invoice")
    assert instance.context.get("phone_verified") is True

    completed, sr_id = await jos.complete(instance.id, user_id=user_id)
    assert completed.status == "completed"
    assert sr_id is not None
    sr = await sr_service.get_by_id(sr_id)
    assert sr is not None
    snapshot = sr.intake_snapshot or {}
    assert snapshot.get("procurement_invoice")
    internal = snapshot.get("internal_review_and_approval") or {}
    assert internal.get("title_ar") == "داخلية — للاطلاع والموافقة"
    assert internal.get("internal_approval_status") == "pending"


@pytest.mark.asyncio
async def test_building_materials_duplicate_active_journey_blocked(db_session: AsyncSession):
    jos = JosService(db_session)
    await jos.start_journey(BUILDING_MATERIALS_JOURNEY_TYPE, anonymous_session_id="dup-1", user_id="u1")
    with pytest.raises(JosDuplicateActiveJourneyError):
        await jos.start_journey(BUILDING_MATERIALS_JOURNEY_TYPE, anonymous_session_id="dup-2", user_id="u1")
