"""Quote BO service tests (WO-018)."""

from __future__ import annotations

from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from models.quotes import QUOTE_STATUS_APPROVED, QUOTE_STATUS_DRAFT, QUOTE_STATUS_ISSUED, QUOTE_STATUS_PENDING_APPROVAL
from services.jos import JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.quotes import QuoteService, QuoteTransitionError, QuoteValidationError
from services.service_requests import ServiceRequestService
from tests.helpers.build_villa_flow import advance_build_villa_v1_to_terminal


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
                "journey_type": "build_villa",
                "name": "Build Villa Discovery",
                "description": "Test",
                "workflow_definition": BUILD_VILLA_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


async def _qualified_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "quote-customer-1"
    session_id = "anon-quote-1"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    await sr_service.start_professional_review(sr.id, actor_user_id="admin-1")
    qualified = await sr_service.mark_qualified(sr.id, actor_user_id="admin-1")
    return qualified


@pytest.mark.asyncio
async def test_create_quote_requires_qualified_sr(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    quote_service = QuoteService(db_session)
    user_id = "quote-customer-2"
    session_id = "anon-quote-2"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None

    with pytest.raises(QuoteValidationError, match="qualified"):
        await quote_service.create_draft(sr.id, created_by_user_id="admin-1")


@pytest.mark.asyncio
async def test_quote_lifecycle_with_vat(db_session: AsyncSession):
    sr = await _qualified_service_request(db_session)
    quote_service = QuoteService(db_session)

    quote = await quote_service.create_draft(sr.id, created_by_user_id="admin-1")
    assert quote.status == QUOTE_STATUS_DRAFT
    assert quote.reference_code == f"QT-{sr.reference_code}"

    quote = await quote_service.add_line_item(
        quote.id,
        description="تصميم معماري أولي",
        quantity=Decimal("1"),
        unit_price=Decimal("10000.00"),
    )
    quote = await quote_service.add_line_item(
        quote.id,
        description="إشراف هندسي — شهر",
        quantity=Decimal("2"),
        unit_price=Decimal("2500.50"),
    )
    assert quote.subtotal == Decimal("15001.00")
    assert quote.vat_amount == Decimal("2250.15")
    assert quote.total_amount == Decimal("17251.15")

    quote = await quote_service.submit_for_approval(quote.id)
    assert quote.status == QUOTE_STATUS_PENDING_APPROVAL

    quote = await quote_service.approve(quote.id, approved_by_user_id="owner-1")
    assert quote.status == QUOTE_STATUS_APPROVED
    assert quote.approved_by_user_id == "owner-1"

    quote = await quote_service.issue(quote.id)
    assert quote.status == QUOTE_STATUS_ISSUED
    assert quote.issued_at is not None
    assert quote.valid_until is not None


@pytest.mark.asyncio
async def test_cannot_submit_empty_quote(db_session: AsyncSession):
    sr = await _qualified_service_request(db_session)
    quote_service = QuoteService(db_session)
    quote = await quote_service.create_draft(sr.id, created_by_user_id="admin-1")

    with pytest.raises(QuoteValidationError, match="line item"):
        await quote_service.submit_for_approval(quote.id)


@pytest.mark.asyncio
async def test_cannot_issue_without_approval(db_session: AsyncSession):
    sr = await _qualified_service_request(db_session)
    quote_service = QuoteService(db_session)
    quote = await quote_service.create_draft(sr.id, created_by_user_id="admin-1")
    await quote_service.add_line_item(
        quote.id,
        description="بند",
        quantity=Decimal("1"),
        unit_price=Decimal("100.00"),
    )

    with pytest.raises(QuoteTransitionError, match="approved"):
        await quote_service.issue(quote.id)
