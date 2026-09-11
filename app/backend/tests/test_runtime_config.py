"""Runtime config adapter for local FastAPI (WO-P2-CONFIG-001)."""

from __future__ import annotations

import httpx
import pytest
from httpx import ASGITransport

from main import app


@pytest.mark.asyncio
async def test_runtime_config_returns_json():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/config")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
    body = response.json()
    assert "API_BASE_URL" in body
    assert body["API_BASE_URL"].startswith("http")
