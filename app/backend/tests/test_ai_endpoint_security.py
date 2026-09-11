"""AI endpoint authorization (WO-P2-SECURITY-AI-001)."""

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
    monkeypatch.setenv("JWT_EXPIRE_MINUTES", os.environ.get("JWT_EXPIRE_MINUTES", "60"))
    monkeypatch.setenv("JWT_ALGORITHM", os.environ.get("JWT_ALGORITHM", "HS256"))


def auth_headers(role: str = "user", user_id: str = "user-1") -> dict[str, str]:
    token = create_access_token(
        {"sub": user_id, "email": "user@example.com", "name": "User", "role": role},
        expires_minutes=60,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_aihub_anonymous_denied():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/aihub/gentxt",
            json={"messages": [{"role": "user", "content": "hello"}]},
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_aihub_malformed_token_rejected():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/aihub/gentxt",
            json={"messages": [{"role": "user", "content": "hello"}]},
            headers={"Authorization": "Bearer not-a-valid-token"},
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_ai_core_workspace_turn_anonymous_allowed():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ai-core/workspace/turn",
            json={"message": "مرحبا", "intent_hint": "build_villa"},
        )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_aihub_authenticated_reaches_service_layer():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/aihub/gentxt",
            json={"messages": [{"role": "user", "content": "hello"}]},
            headers=auth_headers(),
        )
    # Auth passes; downstream AI provider may be unavailable in CI.
    assert response.status_code in (200, 500, 503)
