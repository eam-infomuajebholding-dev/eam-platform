"""Owner Command Center dashboard aggregation tests."""

from __future__ import annotations

import os
from datetime import datetime, timezone

import httpx
import pytest
from httpx import ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.auth import create_access_token
from core.database import Base
from main import app
from models.auth import User
from models.command_center_delegation import CommandCenterDelegation
from models.service_requests import ServiceRequest
from schemas.auth import UserResponse
from services.command_center_access import resolve_command_center_access
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
    assert overview.real_journey_count >= 16
    assert overview.service_request_status_counts.get("submitted", 0) >= 1
    assert any(kpi.metric_id == "service_requests_total" for kpi in overview.executive_kpis)


@pytest.mark.asyncio
async def test_financial_pulse_shows_not_available_not_zero(db_session: AsyncSession):
    overview = await OperationsDashboardService(db_session).get_overview()
    cash = next(m for m in overview.financial_pulse if m.metric_id == "cash_balance")
    assert cash.truth_state == "NOT_AVAILABLE"
    assert cash.value is None

    payments = next(m for m in overview.commercial_readiness if m.item_id == "payment")
    assert payments.status in ("LIVE", "NOT_YET_OPERATIONAL", "PARTIAL")

    evidence = await OperationsDashboardService(db_session).get_metric_evidence("payments_collected_count")
    assert evidence is not None
    assert evidence.metric_id == "payments_collected_count"


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
    assert body["real_journey_count"] >= 16
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
async def test_metric_evidence_includes_lineage_fields(db_session: AsyncSession):
    db_session.add(
        ServiceRequest(
            user_id="u1",
            journey_instance_id=1,
            journey_type="build_villa",
            request_type="build_villa_discovery",
            status="submitted",
            reference_code="BV-00000002",
            intake_snapshot={"journey_type": "build_villa"},
        )
    )
    await db_session.commit()

    evidence = await OperationsDashboardService(db_session).get_metric_evidence("service_requests_total")
    assert evidence is not None
    assert evidence.metric_id == "service_requests_total"
    assert evidence.truth_state == "LIVE"
    assert evidence.contributing_record_count == 1
    assert evidence.data_quality == "AUTHORITATIVE_COUNT"
    assert evidence.owner_domain == "OPERATIONS"
    assert evidence.period is not None


@pytest.mark.asyncio
async def test_metric_evidence_endpoint_requires_admin():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        anon = await client.get("/api/v1/operations/command-center/evidence/service_requests_total")
        admin = await client.get(
            "/api/v1/operations/command-center/evidence/service_requests_total",
            headers=auth_headers(role="admin"),
        )
    assert anon.status_code == 401
    assert admin.status_code == 200
    body = admin.json()
    assert body["metric_id"] == "service_requests_total"
    assert "formula" in body
    assert "truth_state" in body


@pytest.mark.asyncio
async def test_resolve_command_center_access_owner(db_session: AsyncSession):
    access = await resolve_command_center_access(
        db_session,
        UserResponse(id="admin-1", email="admin@example.com", role="admin"),
    )
    assert access is not None
    assert access.role == "owner"
    assert "delegations_manage" in access.permissions


@pytest.mark.asyncio
async def test_resolve_command_center_access_delegate(db_session: AsyncSession):
    db_session.add(User(id="delegate-1", email="delegate@example.com", role="user"))
    db_session.add(User(id="owner-1", email="owner@example.com", role="admin"))
    db_session.add(
        CommandCenterDelegation(
            delegate_user_id="delegate-1",
            granted_by_user_id="owner-1",
        )
    )
    await db_session.commit()

    access = await resolve_command_center_access(
        db_session,
        UserResponse(id="delegate-1", email="delegate@example.com", role="user"),
    )
    assert access is not None
    assert access.role == "delegate"
    assert "read" in access.permissions
    assert "delegations_manage" not in access.permissions


@pytest.mark.asyncio
async def test_command_center_overview_includes_platform_trends(db_session: AsyncSession):
    now = datetime.now(timezone.utc)
    db_session.add(
        ServiceRequest(
            user_id="u1",
            journey_instance_id=1,
            journey_type="build_villa",
            request_type="build_villa_discovery",
            status="submitted",
            reference_code="BV-00000003",
            intake_snapshot={"journey_type": "build_villa"},
            created_at=now,
        )
    )
    await db_session.commit()

    overview = await OperationsDashboardService(db_session).get_overview()
    assert len(overview.platform_trends) == 8
    assert sum(point.service_requests for point in overview.platform_trends) >= 1
    assert any(item.metric_id == "service_requests_total" for item in overview.what_changed)
    assert any(item.metric_id == "qualified_requests" for item in overview.what_changed)


@pytest.mark.asyncio
async def test_resolve_command_center_access_denied_without_delegation(db_session: AsyncSession):
    access = await resolve_command_center_access(
        db_session,
        UserResponse(id="user-1", email="user@example.com", role="user"),
    )
    assert access is None


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
