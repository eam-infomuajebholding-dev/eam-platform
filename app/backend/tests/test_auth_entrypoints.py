"""Auth config and register entry (OIDC PKCE)."""

from __future__ import annotations

import os

import httpx
import pytest
from httpx import ASGITransport

from main import app


@pytest.fixture(autouse=True)
def jwt_secret_env(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "test-jwt-secret"))
    monkeypatch.setenv("OIDC_ISSUER_URL", os.environ.get("OIDC_ISSUER_URL", "https://issuer.example"))
    monkeypatch.setenv("OIDC_CLIENT_ID", os.environ.get("OIDC_CLIENT_ID", "test-client"))
    monkeypatch.setenv("OIDC_CLIENT_SECRET", os.environ.get("OIDC_CLIENT_SECRET", "test-secret"))
    monkeypatch.setenv("OIDC_SCOPE", os.environ.get("OIDC_SCOPE", "openid profile email"))


@pytest.mark.asyncio
async def test_auth_config_endpoint():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/auth/config")
        assert response.status_code == 200
        body = response.json()
        assert body["uses_pkce"] is True
        assert body["oidc_configured"] is True
        assert body["register_path"] == "/api/v1/auth/register"


@pytest.mark.asyncio
async def test_register_redirect_includes_signup_hint():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/auth/register",
            headers={"host": "localhost:3000"},
            follow_redirects=False,
        )
        assert response.status_code == 302
        location = response.headers["location"]
        assert "kc_action=register" in location or "screen_hint=signup" in location
