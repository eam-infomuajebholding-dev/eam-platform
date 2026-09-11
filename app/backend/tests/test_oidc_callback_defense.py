"""Deterministic OIDC callback/login defense tests (no provider credentials required)."""

from __future__ import annotations

import os
from urllib.parse import parse_qs, urlparse

import httpx
import pytest
from httpx import ASGITransport

from main import app


@pytest.fixture(autouse=True)
def jwt_secret_env(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "test-jwt-secret"))
    monkeypatch.setenv("JWT_EXPIRE_MINUTES", os.environ.get("JWT_EXPIRE_MINUTES", "60"))
    monkeypatch.setenv("JWT_ALGORITHM", os.environ.get("JWT_ALGORITHM", "HS256"))


def _error_message(location: str) -> str:
    query = parse_qs(urlparse(location).query)
    return query.get("msg", [""])[0]


@pytest.mark.asyncio
async def test_callback_missing_code_or_state_redirects_to_auth_error():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/auth/callback",
            headers={"host": "localhost:3000"},
            follow_redirects=False,
        )
        assert response.status_code == 302
        assert "/auth/error" in response.headers["location"]
        assert "Missing code or state parameter" in _error_message(response.headers["location"])


@pytest.mark.asyncio
async def test_callback_provider_error_redirects_to_auth_error():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/auth/callback",
            params={"error": "access_denied"},
            headers={"host": "localhost:3000"},
            follow_redirects=False,
        )
        assert response.status_code == 302
        assert "/auth/error" in response.headers["location"]
        assert "OIDC error: access_denied" in _error_message(response.headers["location"])


@pytest.mark.asyncio
async def test_callback_unknown_state_is_single_use():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        unknown_state = "unknown-state-value-for-test"
        first = await client.get(
            "/api/v1/auth/callback",
            params={"code": "dummy-code", "state": unknown_state},
            headers={"host": "localhost:3000"},
            follow_redirects=False,
        )
        assert first.status_code == 302
        assert "/auth/error" in first.headers["location"]
        assert "Invalid or expired state parameter" in _error_message(first.headers["location"])

        second = await client.get(
            "/api/v1/auth/callback",
            params={"code": "dummy-code", "state": unknown_state},
            headers={"host": "localhost:3000"},
            follow_redirects=False,
        )
        assert second.status_code == 302
        assert "Invalid or expired state parameter" in _error_message(second.headers["location"])


@pytest.mark.asyncio
async def test_login_stored_state_is_consumed_on_callback_attempt():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.get(
            "/api/v1/auth/login",
            headers={"host": "localhost:3000"},
            follow_redirects=False,
        )
        assert login.status_code == 302
        authorize_query = parse_qs(urlparse(login.headers["location"]).query)
        state = authorize_query.get("state", [""])[0]
        assert state

        first = await client.get(
            "/api/v1/auth/callback",
            params={"code": "dummy-code", "state": state},
            headers={"host": "localhost:3000"},
            follow_redirects=False,
        )
        assert first.status_code == 302
        assert "/auth/error" in first.headers["location"]

        second = await client.get(
            "/api/v1/auth/callback",
            params={"code": "dummy-code", "state": state},
            headers={"host": "localhost:3000"},
            follow_redirects=False,
        )
        assert second.status_code == 302
        assert "Invalid or expired state parameter" in _error_message(second.headers["location"])


@pytest.mark.asyncio
async def test_login_redirect_uri_uses_local_patch_topology():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.get(
            "/api/v1/auth/login",
            headers={"host": "localhost:3000"},
            follow_redirects=False,
        )
        assert login.status_code == 302
        authorize_query = parse_qs(urlparse(login.headers["location"]).query)
        redirect_uri = authorize_query.get("redirect_uri", [""])[0]
        assert redirect_uri == "http://localhost:3000/api/v1/auth/callback"
