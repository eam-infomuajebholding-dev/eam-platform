"""Service Request lifecycle transition tests (WO-008 STREAM C)."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.jos import JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.service_requests import (
    SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
    SERVICE_REQUEST_STATUS_QUALIFIED,
    SERVICE_REQUEST_STATUS_SUBMITTED,
    SERVICE_REQUEST_STATUS_UNDER_REVIEW,
    ServiceRequestService,
    ServiceRequestTransitionError,
)
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


async def _completed_sr(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "sr-transition-user"
    session_id = "anon-transition"
    instance = await jos.start_journey(
        "build_villa",
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    return sr, sr_service, user_id


@pytest.mark.asyncio
async def test_submitted_to_under_review(db_session: AsyncSession):
    sr, service, _ = await _completed_sr(db_session)
    assert sr.status == SERVICE_REQUEST_STATUS_SUBMITTED
    updated = await service.start_professional_review(sr.id, actor_user_id="admin-1")
    assert updated.status == SERVICE_REQUEST_STATUS_UNDER_REVIEW
    transitions = await service.list_transitions(sr.id)
    assert len(transitions) == 2
    assert transitions[0].metadata_json == {"event": "received"}
    assert transitions[1].from_status == SERVICE_REQUEST_STATUS_SUBMITTED
    assert transitions[1].to_status == SERVICE_REQUEST_STATUS_UNDER_REVIEW


@pytest.mark.asyncio
async def test_request_information_and_customer_response(db_session: AsyncSession):
    sr, service, user_id = await _completed_sr(db_session)
    await service.start_professional_review(sr.id, actor_user_id="admin-1")
    updated = await service.request_information(
        sr.id,
        actor_user_id="admin-1",
        customer_message="يرجى إرفاق مخطط الأرض.",
    )
    assert updated.status == SERVICE_REQUEST_STATUS_AWAITING_INFORMATION

    await service.record_customer_response(
        sr.id,
        user_id=user_id,
        message="تم إرفاق المخطط عبر الرابط.",
    )
    activity = await service.list_customer_visible_transitions(sr.id)
    assert any("يرجى إرفاق" in (row.customer_message or "") for row in activity)
    assert any("تم إرفاق" in (row.customer_message or "") for row in activity)


@pytest.mark.asyncio
async def test_qualify_from_under_review(db_session: AsyncSession):
    sr, service, _ = await _completed_sr(db_session)
    await service.start_professional_review(sr.id, actor_user_id="admin-1")
    qualified = await service.mark_qualified(sr.id, actor_user_id="admin-1", reason="scope clear")
    assert qualified.status == SERVICE_REQUEST_STATUS_QUALIFIED


@pytest.mark.asyncio
async def test_invalid_transition_rejected(db_session: AsyncSession):
    sr, service, _ = await _completed_sr(db_session)
    with pytest.raises(ServiceRequestTransitionError):
        await service.mark_qualified(sr.id, actor_user_id="admin-1")
