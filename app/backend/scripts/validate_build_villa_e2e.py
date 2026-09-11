"""Manual API end-to-end validation for Build Villa journey."""

import asyncio
import json
import uuid

import httpx
from httpx import ASGITransport

from main import app


async def run_e2e() -> None:
    session_id = str(uuid.uuid4())
    headers = {"X-Anonymous-Session-Id": session_id}
    transport = ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        definition = await client.get("/api/v1/jos/definitions/build_villa")
        assert definition.status_code == 200, definition.text
        workflow = definition.json()["workflow_definition"]
        assert workflow["initial_step"] == "city", workflow

        start = await client.post(
            "/api/v1/jos/instances/start",
            json={"journey_type": "build_villa", "anonymous_session_id": session_id},
        )
        assert start.status_code == 201, start.text
        instance = start.json()
        instance_id = instance["id"]
        assert instance["current_step_key"] == "city"

        invalid = await client.post(
            f"/api/v1/jos/instances/{instance_id}/advance",
            json={"input": {"city": "x"}},
            headers=headers,
        )
        assert invalid.status_code == 422, invalid.text
        assert "errors" in invalid.json()["detail"]

        steps = [
            ({"city": "Riyadh"}, "land_ownership"),
            ({"land_ownership_type": "owned"}, "land_area"),
            ({"land_area_sqm": 600}, "documents_context"),
            ({}, "desired_service"),
            ({"desired_service": "design_only"}, "intake_complete"),
        ]

        for payload, expected_step in steps:
            response = await client.post(
                f"/api/v1/jos/instances/{instance_id}/advance",
                json={"input": payload},
                headers=headers,
            )
            assert response.status_code == 200, response.text
            body = response.json()
            assert body["current_step_key"] == expected_step, body

        final = await client.get(f"/api/v1/jos/instances/{instance_id}", headers=headers)
        context = final.json()["context"]
        assert context["draft_status"] == "ready_for_handoff"
        assert context["intake_draft"]["city"] == "Riyadh"

        blocked = await client.post(
            f"/api/v1/jos/instances/{instance_id}/advance",
            json={"input": {"city": "Riyadh"}},
            headers=headers,
        )
        assert blocked.status_code == 409, blocked.text

        complete = await client.post(
            f"/api/v1/jos/instances/{instance_id}/complete",
            headers=headers,
        )
        assert complete.status_code == 200, complete.text
        assert complete.json()["status"] == "completed"

        events = await client.get(f"/api/v1/jos/instances/{instance_id}/events", headers=headers)
        event_types = [item["event_type"] for item in events.json()["items"]]
        for required in (
            "journey_started",
            "step_advanced",
            "validation_failed",
            "intake_draft_assembled",
            "journey_completed",
        ):
            assert required in event_types, event_types

        print("API E2E passed")
        print(json.dumps({"instance_id": instance_id, "event_types": event_types}, indent=2))


if __name__ == "__main__":
    asyncio.run(run_e2e())
