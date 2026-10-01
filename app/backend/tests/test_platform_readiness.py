"""Platform readiness endpoint."""

from __future__ import annotations

import os

import httpx
import pytest
from httpx import ASGITransport

from main import app
from services.platform_readiness import EXPECTED_ALEMBIC_HEAD, get_platform_readiness


@pytest.fixture(autouse=True)
def jwt_env(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "test-readiness-secret-key"))
    monkeypatch.setenv("DATABASE_URL", os.environ.get("DATABASE_URL", "sqlite:///./test_readiness.db"))


def test_readiness_structure():
    data = get_platform_readiness()
    assert data["overall"] in ("READY", "DEGRADED", "BLOCKED")
    assert data["alembic"]["expected_head"] == EXPECTED_ALEMBIC_HEAD
    assert data["live_journey_count"] == 13


@pytest.mark.asyncio
async def test_readiness_http():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/platform/readiness")
    assert resp.status_code == 200
    body = resp.json()
    assert "blockers" in body
    assert "pending_external" in body
