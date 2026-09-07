"""Integration tests for AI Core + JOS handoff (WO-004)."""

from __future__ import annotations

import uuid

import httpx
import pytest
from httpx import ASGITransport

from main import app


@pytest.mark.asyncio
async def test_workspace_turn_start_journey_for_arabic_text():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ai-core/workspace/turn",
            json={"message": "أريد بناء فيلا في جدة"},
        )
        assert response.status_code == 200, response.text
        body = response.json()
        assert body["action"] == "start_journey"
        assert body["journey_type"] == "build_villa"


@pytest.mark.asyncio
async def test_ai_handoff_event_and_full_journey_from_workspace():
    session_id = str(uuid.uuid4())
    headers = {"X-Anonymous-Session-Id": session_id}
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        start = await client.post(
            "/api/v1/jos/instances/start",
            json={
                "journey_type": "build_villa",
                "anonymous_session_id": session_id,
                "initial_context": {"source_channel": "hero_workspace"},
            },
        )
        assert start.status_code == 201, start.text
        instance_id = start.json()["id"]

        handoff = await client.post(
            f"/api/v1/jos/instances/{instance_id}/events",
            json={
                "event_type": "ai_handoff",
                "payload": {"source": "quick_action", "journey_type": "build_villa"},
            },
            headers=headers,
        )
        assert handoff.status_code == 201, handoff.text

        steps = [
            ({"city": "Jeddah"}, "land_ownership"),
            ({"land_ownership_type": "owned"}, "land_area"),
            ({"land_area_sqm": 650}, "documents_context"),
            ({}, "desired_service"),
            ({"desired_service": "design_only"}, "intake_complete"),
        ]
        for payload, expected in steps:
            advance = await client.post(
                f"/api/v1/jos/instances/{instance_id}/advance",
                json={"input": payload},
                headers=headers,
            )
            assert advance.status_code == 200, advance.text
            assert advance.json()["current_step_key"] == expected

        instance = await client.get(f"/api/v1/jos/instances/{instance_id}", headers=headers)
        assert instance.json()["context"]["intake_draft"]["city"] == "Jeddah"

        blocked = await client.post(
            f"/api/v1/jos/instances/{instance_id}/advance",
            json={"input": {"city": "Jeddah"}},
            headers=headers,
        )
        assert blocked.status_code == 409

        complete = await client.post(
            f"/api/v1/jos/instances/{instance_id}/complete",
            headers=headers,
        )
        assert complete.status_code == 200
        assert complete.json()["status"] == "completed"

        events = await client.get(f"/api/v1/jos/instances/{instance_id}/events", headers=headers)
        event_types = [item["event_type"] for item in events.json()["items"]]
        assert "ai_handoff" in event_types
