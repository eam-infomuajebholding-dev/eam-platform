"""Tests for JOS identity continuity and journey persistence (WO-005)."""

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
from services.jos import JosAccessError, JosDuplicateActiveJourneyError, JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition


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
async def test_anonymous_start_creates_instance():
    session_id = str(uuid.uuid4())
    headers = {"X-Anonymous-Session-Id": session_id}
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/jos/instances/start",
            json={
                "journey_type": "build_villa",
                "anonymous_session_id": session_id,
            },
            headers=headers,
        )

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["journey_type"] == "build_villa"
    assert body["status"] == "active"
    assert body["anonymous_session_id"] == session_id
    assert body["user_id"] is None


@pytest.mark.asyncio
async def test_attach_with_matching_anonymous_session_succeeds(db_session: AsyncSession):
    service = JosService(db_session)
    session_id = "attach-match-session"
    user_id = "auth-user-1"

    instance = await service.start_journey("build_villa", anonymous_session_id=session_id)
    attached, _ = await service.attach_identity(
        instance.id,
        user_id=user_id,
        anonymous_session_id=session_id,
    )

    assert attached.user_id == user_id
    assert attached.anonymous_session_id == session_id


@pytest.mark.asyncio
async def test_attach_with_wrong_anonymous_session_fails(db_session: AsyncSession):
    service = JosService(db_session)
    session_id = "owner-session"

    instance = await service.start_journey("build_villa", anonymous_session_id=session_id)

    with pytest.raises(JosAccessError):
        await service.attach_identity(
            instance.id,
            user_id="auth-user-1",
            anonymous_session_id="other-session",
        )


@pytest.mark.asyncio
async def test_attach_records_identity_attached_event(db_session: AsyncSession):
    service = JosService(db_session)
    session_id = "event-session"
    user_id = "auth-user-2"

    instance = await service.start_journey("build_villa", anonymous_session_id=session_id)
    await service.attach_identity(instance.id, user_id=user_id, anonymous_session_id=session_id)

    events = await service.list_events(instance.id)
    assert any(event.event_type == "identity_attached" for event in events)


@pytest.mark.asyncio
async def test_attached_instance_accessible_via_jwt():
    session_id = str(uuid.uuid4())
    user_id = "jwt-user-1"
    anon_headers = {"X-Anonymous-Session-Id": session_id}
    auth = auth_headers(user_id=user_id)
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        start = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_id},
            headers=anon_headers,
        )
        instance_id = start.json()["id"]

        attach = await client.post(
            f"/api/v1/jos/instances/{instance_id}/attach",
            headers={**auth, **anon_headers},
        )
        assert attach.status_code == 200, attach.text

        jwt_only = await client.get(
            f"/api/v1/jos/instances/{instance_id}",
            headers=auth,
        )
        assert jwt_only.status_code == 200, jwt_only.text
        assert jwt_only.json()["user_id"] == user_id


@pytest.mark.asyncio
async def test_attach_without_anonymous_header_fails():
    session_id = str(uuid.uuid4())
    user_id = "jwt-user-2"
    auth = auth_headers(user_id=user_id)
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        start = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_id},
            headers={"X-Anonymous-Session-Id": session_id},
        )
        instance_id = start.json()["id"]

        attach = await client.post(
            f"/api/v1/jos/instances/{instance_id}/attach",
            headers=auth,
        )
        assert attach.status_code == 400, attach.text


@pytest.mark.asyncio
async def test_duplicate_build_villa_returns_409_with_existing_id():
    session_id = str(uuid.uuid4())
    headers = {"X-Anonymous-Session-Id": session_id}
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        first = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_id},
            headers=headers,
        )
        assert first.status_code == 201, first.text
        existing_id = first.json()["id"]

        duplicate = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_id},
            headers=headers,
        )
        assert duplicate.status_code == 409, duplicate.text
        detail = duplicate.json()["detail"]
        assert detail["existing_instance_id"] == existing_id


@pytest.mark.asyncio
async def test_duplicate_build_villa_for_authenticated_user(db_session: AsyncSession):
    service = JosService(db_session)
    user_id = "dup-auth-user"

    first = await service.start_journey("build_villa", user_id=user_id, anonymous_session_id="anon-a")
    with pytest.raises(JosDuplicateActiveJourneyError) as exc:
        await service.start_journey("build_villa", user_id=user_id, anonymous_session_id="anon-b")
    assert exc.value.existing_instance_id == first.id


@pytest.mark.asyncio
async def test_intake_draft_survives_attach(db_session: AsyncSession):
    service = JosService(db_session)
    session_id = "draft-session"
    user_id = "draft-user"

    instance = await service.start_journey("build_villa", anonymous_session_id=session_id)
    instance = await service.advance(instance.id, input_data={"city": "Riyadh"}, anonymous_session_id=session_id)
    instance = await service.advance(
        instance.id,
        input_data={"land_ownership_type": "owned"},
        anonymous_session_id=session_id,
    )
    instance = await service.advance(
        instance.id,
        input_data={"land_area_sqm": 400},
        anonymous_session_id=session_id,
    )
    instance = await service.advance(instance.id, input_data={}, anonymous_session_id=session_id)
    instance = await service.advance(
        instance.id,
        input_data={"desired_service": "design_only"},
        anonymous_session_id=session_id,
    )
    assert instance.context["intake_draft"]["city"] == "Riyadh"

    attached, _ = await service.attach_identity(
        instance.id,
        user_id=user_id,
        anonymous_session_id=session_id,
    )
    assert attached.context["intake_draft"]["city"] == "Riyadh"
    assert attached.anonymous_session_id == session_id


@pytest.mark.asyncio
async def test_list_active_instances_scoped_to_identity():
    session_a = str(uuid.uuid4())
    session_b = str(uuid.uuid4())
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        start_a = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_a},
            headers={"X-Anonymous-Session-Id": session_a},
        )
        assert start_a.status_code == 201, start_a.text

        start_b = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_b},
            headers={"X-Anonymous-Session-Id": session_b},
        )
        assert start_b.status_code == 201, start_b.text

        list_a = await client.get(
            "/api/v1/jos/instances/active?journey_type=build_villa",
            headers={"X-Anonymous-Session-Id": session_a},
        )
        assert list_a.status_code == 200, list_a.text
        ids_a = [item["id"] for item in list_a.json()["items"]]
        assert start_a.json()["id"] in ids_a
        assert start_b.json()["id"] not in ids_a


@pytest.mark.asyncio
async def test_refresh_restores_same_instance_via_get():
    session_id = str(uuid.uuid4())
    headers = {"X-Anonymous-Session-Id": session_id}
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        start = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_id},
            headers=headers,
        )
        instance_id = start.json()["id"]

        advance = await client.post(
            f"/api/v1/jos/instances/{instance_id}/advance",
            json={"input": {"city": "Dammam"}},
            headers=headers,
        )
        assert advance.status_code == 200, advance.text

        restored = await client.get(f"/api/v1/jos/instances/{instance_id}", headers=headers)
        assert restored.status_code == 200, restored.text
        body = restored.json()
        assert body["id"] == instance_id
        assert body["current_step_key"] == "land_ownership"
        assert body["context"]["city"] == "Dammam"
