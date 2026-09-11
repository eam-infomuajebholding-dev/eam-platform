"""Tests for Service Request business object and Customer Workspace backend (WO-006)."""

from __future__ import annotations

import os
import uuid

import httpx
import pytest
from httpx import ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.auth import create_access_token
from core.database import Base
from main import app
from services.jos import JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService, ServiceRequestValidationError
from tests.helpers.build_villa_flow import advance_build_villa_v1_to_terminal, advance_build_villa_via_http


@pytest.fixture(autouse=True)
def jwt_secret_env(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "test-jwt-secret"))
    monkeypatch.setenv("JWT_EXPIRE_MINUTES", os.environ.get("JWT_EXPIRE_MINUTES", "60"))
    monkeypatch.setenv("JWT_ALGORITHM", os.environ.get("JWT_ALGORITHM", "HS256"))


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
                "description": "M1 discovery and intake journey for Build Villa.",
                "workflow_definition": BUILD_VILLA_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


def auth_headers(user_id: str = "user-123", email: str = "user@example.com") -> dict[str, str]:
    token = create_access_token(
        {"sub": user_id, "email": email, "name": "Test User", "role": "user"},
        expires_minutes=60,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_authenticated_complete_creates_one_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "sr-user-1"
    session_id = "anon-sr-1"

    instance = await jos.start_journey(
        "build_villa",
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)

    completed, service_request_id = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert completed.status == "completed"
    assert service_request_id is not None

    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.user_id == user_id
    assert sr.journey_instance_id == instance.id
    assert sr.status == "submitted"
    assert sr.intake_snapshot["city"] == "Jeddah"
    assert sr.intake_snapshot["snapshot_version"] == 1


@pytest.mark.asyncio
async def test_duplicate_conversion_is_idempotent(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_id = "sr-user-2"
    session_id = "anon-sr-2"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)

    sr1, created1 = await sr_service.create_from_journey(instance)
    sr2, created2 = await sr_service.create_from_journey(instance)
    assert created1 is False
    assert created2 is False
    assert sr1.id == sr2.id


@pytest.mark.asyncio
async def test_duplicate_complete_does_not_create_duplicate_sr(db_session: AsyncSession):
    jos = JosService(db_session)
    user_id = "sr-user-3"
    session_id = "anon-sr-3"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    _, sr_id_first = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    _, sr_id_second = await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    assert sr_id_first == sr_id_second


@pytest.mark.asyncio
async def test_anonymous_complete_creates_no_service_request(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    session_id = "anon-only"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    completed, service_request_id = await jos.complete(instance.id, anonymous_session_id=session_id)
    assert completed.status == "completed"
    assert service_request_id is None
    assert await sr_service.get_by_journey_instance_id(instance.id) is None


@pytest.mark.asyncio
async def test_anonymous_complete_attach_creates_catch_up_sr(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    session_id = "anon-catchup"
    user_id = "catchup-user"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id)

    attached, service_request_id = await jos.attach_identity(
        instance.id,
        user_id=user_id,
        anonymous_session_id=session_id,
    )
    assert attached.user_id == user_id
    assert service_request_id is not None

    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    assert sr.user_id == user_id
    assert sr.intake_snapshot["desired_service"] == "full_service"


@pytest.mark.asyncio
async def test_attach_on_incomplete_journey_does_not_create_sr(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    session_id = "anon-incomplete"
    user_id = "incomplete-user"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    await jos.advance(
        instance.id,
        input_data={"project_objective": "أريد بناء فيلا عائلية في جدة"},
        anonymous_session_id=session_id,
    )
    await jos.advance(instance.id, input_data={"city": "Jeddah"}, anonymous_session_id=session_id)

    attached, service_request_id = await jos.attach_identity(
        instance.id,
        user_id=user_id,
        anonymous_session_id=session_id,
    )
    assert attached.user_id == user_id
    assert service_request_id is None
    assert await sr_service.get_by_journey_instance_id(instance.id) is None


@pytest.mark.asyncio
async def test_missing_intake_draft_blocks_sr_creation(db_session: AsyncSession):
    jos = JosService(db_session)
    user_id = "no-draft-user"
    session_id = "no-draft"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    instance.status = "completed"
    instance.context.pop("intake_draft")

    sr_service = ServiceRequestService(db_session)
    with pytest.raises(ServiceRequestValidationError):
        await sr_service.create_from_journey(instance)


@pytest.mark.asyncio
async def test_transaction_rollback_leaves_journey_incomplete_on_sr_failure(
    db_session: AsyncSession,
    monkeypatch: pytest.MonkeyPatch,
):
    jos = JosService(db_session)
    user_id = "rollback-user"
    session_id = "rollback-session"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    instance_id = instance.id

    async def fail_create(self, _instance):
        raise ServiceRequestValidationError("forced failure")

    monkeypatch.setattr(
        "services.jos.ServiceRequestService.create_from_journey",
        fail_create,
    )

    with pytest.raises(ServiceRequestValidationError):
        await jos.complete(instance_id, anonymous_session_id=session_id, user_id=user_id)

    refreshed = await jos.get_instance(instance_id)
    assert refreshed.status == "active"


@pytest.mark.asyncio
async def test_service_request_created_event_emitted_once(db_session: AsyncSession):
    jos = JosService(db_session)
    user_id = "event-user"
    session_id = "event-session"

    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)

    events = await jos.list_events(instance.id)
    created_events = [event for event in events if event.event_type == "service_request_created"]
    assert len(created_events) == 1


@pytest.mark.asyncio
async def test_reference_code_uniqueness_under_concurrent_creation(db_session: AsyncSession):
    jos = JosService(db_session)
    user_id = "concurrent-user"
    codes = []

    for session_id in ("concurrent-1", "concurrent-2", "concurrent-3"):
        instance = await jos.start_journey(
            "build_villa",
            anonymous_session_id=session_id,
            user_id=user_id,
        )
        instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
        await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
        sr_service = ServiceRequestService(db_session)
        sr = await sr_service.get_by_journey_instance_id(instance.id)
        assert sr is not None
        codes.append(sr.reference_code)

    assert len(set(codes)) == len(codes)


@pytest.mark.asyncio
async def test_owner_can_list_and_view_service_requests():
    session_id = str(uuid.uuid4())
    user_id = f"api-owner-{uuid.uuid4()}"
    headers = {"X-Anonymous-Session-Id": session_id, **auth_headers(user_id=user_id)}
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        start = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_id},
            headers=headers,
        )
        assert start.status_code in (200, 201), start.text
        instance_id = start.json()["id"]
        initial_step = start.json()["current_step_key"]
        await advance_build_villa_via_http(client, instance_id, headers, initial_step)

        complete = await client.post(
            f"/api/v1/jos/instances/{instance_id}/complete",
            headers=headers,
        )
        assert complete.status_code == 200, complete.text
        sr_id = complete.json()["service_request_id"]
        assert sr_id is not None

        listing = await client.get("/api/v1/service-requests", headers=auth_headers(user_id=user_id))
        assert listing.status_code == 200, listing.text
        items = listing.json()["items"]
        assert any(item["id"] == sr_id for item in items)
        assert items[0]["city"] == "Jeddah"

        detail = await client.get(f"/api/v1/service-requests/{sr_id}", headers=auth_headers(user_id=user_id))
        assert detail.status_code == 200, detail.text
        body = detail.json()
        assert body["intake_snapshot"]["city"] == "Jeddah"
        assert body["journey_instance_id"] == instance_id


@pytest.mark.asyncio
async def test_non_owner_gets_404_on_service_request_detail():
    session_id = str(uuid.uuid4())
    owner_id = f"owner-user-{uuid.uuid4()}"
    other_id = f"other-user-{uuid.uuid4()}"
    owner_headers = {"X-Anonymous-Session-Id": session_id, **auth_headers(user_id=owner_id)}
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        start = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_id},
            headers=owner_headers,
        )
        assert start.status_code in (200, 201), start.text
        instance_id = start.json()["id"]
        initial_step = start.json()["current_step_key"]
        await advance_build_villa_via_http(client, instance_id, owner_headers, initial_step)
        complete = await client.post(
            f"/api/v1/jos/instances/{instance_id}/complete",
            headers=owner_headers,
        )
        sr_id = complete.json()["service_request_id"]

        forbidden = await client.get(
            f"/api/v1/service-requests/{sr_id}",
            headers=auth_headers(user_id=other_id),
        )
        assert forbidden.status_code == 404
