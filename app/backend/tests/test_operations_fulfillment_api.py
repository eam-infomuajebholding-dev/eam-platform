"""Operations procurement + logistics API smoke tests."""

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


def auth_headers(user_id: str, role: str = "admin") -> dict[str, str]:
    token = create_access_token(
        {"sub": user_id, "email": f"{user_id}@example.com", "name": "Test", "role": role},
        expires_minutes=60,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_admin_can_list_procurement_orders_and_shipments():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        po = await client.get(
            "/api/v1/operations/procurement-orders",
            headers=auth_headers("admin-fulfillment"),
        )
        assert po.status_code == 200
        assert "items" in po.json()

        ship = await client.get(
            "/api/v1/operations/logistics/shipments?service_request_id=999999",
            headers=auth_headers("admin-fulfillment"),
        )
        assert ship.status_code == 200
        assert ship.json()["items"] == []


@pytest.mark.asyncio
async def test_user_cannot_list_procurement_orders():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/v1/operations/procurement-orders",
            headers=auth_headers("user-1", role="user"),
        )
        assert resp.status_code == 403
