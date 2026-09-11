"""Professional Review operations API tests (WO-008 STREAM C)."""

from __future__ import annotations

import os

import httpx
import pytest
from httpx import ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.auth import create_access_token
from core.database import Base
from main import app
from services.jos import JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.service_requests import (
    SERVICE_REQUEST_STATUS_QUALIFIED,
    SERVICE_REQUEST_STATUS_UNDER_REVIEW,
    ServiceRequestService,
)
from tests.helpers.build_villa_flow import advance_build_villa_v1_to_terminal


@pytest.fixture(autouse=True)
def jwt_secret_env(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "test-jwt-secret"))


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


def auth_headers(user_id: str, role: str = "user") -> dict[str, str]:
    token = create_access_token(
        {"sub": user_id, "email": f"{user_id}@example.com", "name": "Test", "role": role},
        expires_minutes=60,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_professional_review_service_flow(db_session: AsyncSession):
    jos = JosService(db_session)
    service = ServiceRequestService(db_session)
    user_id = "ops-customer-1"
    session_id = "anon-ops-1"
    instance = await jos.start_journey(
        "build_villa",
        anonymous_session_id=session_id,
        user_id=user_id,
    )
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    sr = await service.get_by_journey_instance_id(instance.id)
    assert sr is not None

    reviewed = await service.start_professional_review(sr.id, actor_user_id="admin-1")
    assert reviewed.status == SERVICE_REQUEST_STATUS_UNDER_REVIEW
    qualified = await service.mark_qualified(sr.id, actor_user_id="admin-1")
    assert qualified.status == SERVICE_REQUEST_STATUS_QUALIFIED


@pytest.mark.asyncio
async def test_non_admin_cannot_access_operations_queue():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/v1/operations/service-requests",
            headers=auth_headers("user-1", role="user"),
        )
        assert resp.status_code == 403
