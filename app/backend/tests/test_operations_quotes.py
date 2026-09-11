"""Quote operations API tests (WO-018)."""

from __future__ import annotations

import os

import httpx
import pytest
from httpx import ASGITransport

from core.auth import create_access_token
from main import app


@pytest.fixture(autouse=True)
def jwt_secret_env(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "test-jwt-secret"))


def auth_headers(user_id: str, role: str = "user") -> dict[str, str]:
    token = create_access_token(
        {"sub": user_id, "email": f"{user_id}@example.com", "name": "Test", "role": role},
        expires_minutes=60,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_non_admin_cannot_create_quote():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/operations/service-requests/1/quotes",
            headers=auth_headers("user-1", role="user"),
            json={},
        )
        assert resp.status_code == 403
