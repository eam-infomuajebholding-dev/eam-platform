"""Owner Command Center dashboard aggregation tests."""

from __future__ import annotations

import os

import httpx
import pytest
from httpx import ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.auth import create_access_token
from core.database import Base
from main import app
from models.service_requests import ServiceRequest
from services.operations_dashboard import OperationsDashboardService


@pytest.fixture(autouse=True)
def jwt_secret_env(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "test-jwt-secret"))
    monkeypatch.setenv("JWT_EXPIRE_MINUTES", os.environ.get("JWT_EXPIRE_MINUTES", "60"))
    monkeypatch.setenv("JWT_ALGORITHM", os.environ.get("JWT_ALGORITHM", "HS256"))


def auth_headers(role: str = "admin", user_id: str = "admin-1", email: str = "admin@example.com") -> dict[str, str]:
    token = create_access_token(
        {"sub": user_id, "email": email, "name": "Admin", "role": role},
        expires_minutes=60,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_command_center_overview_aggregates_service_requests(db_session: AsyncSession):
    db_session.add(
        ServiceRequest(
            user_id="u1",
            journey_instance_id=1,
            journey_type="build_villa",
            request_type="build_villa_discovery",
            status="submitted",
            reference_code="BV-00000001",
            intake_snapshot={"journey_type": "build_villa"},
        )
    )
    await db_session.commit()

    overview = await OperationsDashboardService(db_session).get_overview()
    assert overview.real_journey_count >= 8
    assert overview.service_request_status_counts.get("submitted", 0) >= 1
    assert any(kpi.metric_id == "service_requests_total" for kpi in overview.executive_kpis)


@pytest.mark.asyncio
async def test_financial_pulse_shows_not_available_not_zero(db_session: AsyncSession):
    overview = await OperationsDashboardService(db_session).get_overview()
    cash = next(m for m in overview.financial_pulse if m.metric_id == "cash_balance")
    assert cash.truth_state == "NOT_AVAILABLE"
    assert cash.value is None


@pytest.mark.asyncio
async def test_command_center_overview_requires_admin():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        anon = await client.get("/api/v1/operations/command-center/overview")
        user = await client.get(
            "/api/v1/operations/command-center/overview",
            headers=auth_headers(role="user"),
        )
        admin = await client.get(
            "/api/v1/operations/command-center/overview",
            headers=auth_headers(role="admin"),
        )
    assert anon.status_code == 401
    assert user.status_code == 403
    assert admin.status_code == 200
    body = admin.json()
    assert body["real_journey_count"] >= 8
    assert "financial_pulse" in body
    assert len(body.get("strategic_scorecard", [])) >= 1
    assert len(body.get("operating_pulse", [])) >= 1


@pytest.mark.asyncio
async def test_executive_brief_endpoint_returns_rule_assisted():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/operations/command-center/executive-brief",
            headers=auth_headers(role="admin"),
        )
    assert response.status_code == 200
    body = response.json()
    assert body["ai_assistance"] == "RULE_ASSISTED"
    assert len(body["facts"]) >= 1


@pytest.mark.asyncio
async def test_executive_brief_is_rule_assisted(db_session: AsyncSession):
    service = OperationsDashboardService(db_session)
    overview = await service.get_overview()
    brief = service.build_executive_brief(overview)
    assert brief.ai_assistance == "RULE_ASSISTED"
    assert len(brief.facts) >= 1
    assert any(
        "QUOTE" in d or "عروض" in d or "Quote" in d
        for d in brief.decisions_needed + brief.watch_next + brief.what_matters
    )
