"""CMS entity write protection (WO-P2-SECURITY-CMS-001)."""

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


def auth_headers(role: str = "admin", user_id: str = "admin-1", email: str = "admin@example.com") -> dict[str, str]:
    token = create_access_token(
        {"sub": user_id, "email": email, "name": "Admin", "role": role},
        expires_minutes=60,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_anonymous_cms_write_denied():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/entities/projects",
            json={"name": "Blocked", "description": "x"},
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_authenticated_non_admin_cms_write_denied():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/entities/projects",
            json={"name": "Blocked User", "description": "x"},
            headers=auth_headers(role="user"),
        )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_cms_write_allowed():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/entities/projects",
            json={"name": "Allowed", "description": "x"},
            headers=auth_headers(role="admin"),
        )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Allowed"


@pytest.mark.asyncio
async def test_public_cms_read_remains_functional():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/entities/projects")
    assert response.status_code == 200
    assert "items" in response.json()


@pytest.mark.asyncio
async def test_anonymous_lead_intake_create_allowed():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/entities/contact_messages",
            json={
                "name": "Visitor",
                "email": "visitor@example.com",
                "message": "Hello",
            },
        )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_anonymous_lead_batch_write_denied():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/entities/contact_messages/batch",
            json={"items": [{"name": "A", "email": "a@example.com", "message": "Hi"}]},
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_anonymous_lead_list_denied():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/entities/contact_messages")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_anonymous_lead_update_denied():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.put(
            "/api/v1/entities/contact_messages/1",
            json={"message": "changed"},
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_malformed_jwt_rejected_for_cms_write():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/entities/projects",
            json={"name": "Bad Token", "description": "x"},
            headers={"Authorization": "Bearer invalid.token.value"},
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_anonymous_consultation_create_allowed():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/entities/consultations",
            json={
                "name": "Visitor",
                "email": "visitor@example.com",
                "message": "Need consultation",
            },
        )
    assert response.status_code == 201
