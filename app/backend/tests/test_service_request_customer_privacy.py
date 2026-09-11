"""Customer privacy and cross-customer isolation for Service Requests (WO-008)."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.jos import JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.service_requests import (
    SERVICE_REQUEST_STATUS_AWAITING_INFORMATION,
    ServiceRequestService,
    ServiceRequestTransitionError,
    ServiceRequestValidationError,
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


async def _create_sr(db_session: AsyncSession, user_id: str, session_id: str):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    instance = await jos.start_journey(
        "build_villa",
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    return sr, sr_service


@pytest.mark.asyncio
async def test_customer_activity_excludes_internal_notes(db_session: AsyncSession):
    sr, service = await _create_sr(db_session, "privacy-user", "privacy-session")
    await service.start_professional_review(sr.id, actor_user_id="admin-1", internal_note="سري للفريق")
    await service.request_information(
        sr.id,
        actor_user_id="admin-1",
        customer_message="يرجى إرفاق المخطط.",
        internal_note="تحقق من صحة المخطط",
    )

    activity = await service.list_customer_activity(sr.id)
    serialized = " ".join(
        [
            *(ServiceRequestService.customer_event_label(row) for row in activity),
            *(row.customer_message or "" for row in activity),
        ]
    )
    assert "سري للفريق" not in serialized
    assert "تحقق من صحة المخطط" not in serialized
    assert any(ServiceRequestService.customer_event_label(row) == "تم استلام الطلب" for row in activity)
    assert any("يرجى إرفاق" in (row.customer_message or "") for row in activity)


@pytest.mark.asyncio
async def test_customer_a_cannot_read_customer_b_request(db_session: AsyncSession):
    sr_a, service = await _create_sr(db_session, "user-a", "session-a")
    assert await service.get_by_id_for_user(sr_a.id, "user-b") is None


@pytest.mark.asyncio
async def test_customer_a_cannot_respond_to_customer_b_request(db_session: AsyncSession):
    sr_a, service = await _create_sr(db_session, "user-a", "session-a")
    await service.start_professional_review(sr_a.id, actor_user_id="admin-1")
    await service.request_information(
        sr_a.id,
        actor_user_id="admin-1",
        customer_message="أرسل المخطط.",
    )

    with pytest.raises(ServiceRequestValidationError):
        await service.record_customer_response(
            sr_a.id,
            user_id="user-b",
            message="محاولة اختراق",
        )


@pytest.mark.asyncio
async def test_internal_note_recorded_without_status_change(db_session: AsyncSession):
    sr, service = await _create_sr(db_session, "note-user", "note-session")
    transition = await service.record_internal_note(
        sr.id,
        actor_user_id="admin-1",
        internal_note="ملاحظة داخلية",
    )
    assert transition.from_status == sr.status
    assert transition.to_status == sr.status
    activity = await service.list_customer_activity(sr.id)
    assert all("ملاحظة داخلية" not in (row.internal_note or "") for row in activity)
    assert not any(ServiceRequestService.customer_event_label(row) == "ملاحظة داخلية" for row in activity)
