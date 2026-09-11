"""Canonical AI tool registry (metadata only — execution via Tool Policy Gateway)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

RiskLevel = Literal["READ_ONLY_LOW_RISK", "READ_PRIVATE", "WRITE_REVERSIBLE", "WRITE_HIGH_IMPACT"]


@dataclass(frozen=True)
class ToolDefinition:
    tool_id: str
    description: str
    input_schema: dict
    output_schema: dict
    risk: RiskLevel
    auth_required: bool
    permission: str
    side_effect: Literal["none", "read", "write"]
    idempotent: bool
    requires_confirmation: bool
    owner: str
    timeout_seconds: int = 30


TOOL_REGISTRY: dict[str, ToolDefinition] = {
    "journey.start": ToolDefinition(
        tool_id="journey.start",
        description="Start a canonical JOS journey by type",
        input_schema={"type": "object", "required": ["journey_type"], "properties": {"journey_type": {"type": "string"}}},
        output_schema={"type": "object", "properties": {"journey_instance_id": {"type": "integer"}}},
        risk="WRITE_REVERSIBLE",
        auth_required=False,
        permission="journey.start",
        side_effect="write",
        idempotent=False,
        requires_confirmation=True,
        owner="jos",
    ),
    "journey.resume": ToolDefinition(
        tool_id="journey.resume",
        description="Resume a paused journey instance owned by caller",
        input_schema={"type": "object", "required": ["journey_instance_id"], "properties": {"journey_instance_id": {"type": "integer"}}},
        output_schema={"type": "object", "properties": {"status": {"type": "string"}}},
        risk="WRITE_REVERSIBLE",
        auth_required=False,
        permission="journey.resume",
        side_effect="write",
        idempotent=True,
        requires_confirmation=False,
        owner="jos",
    ),
    "journey.read_state": ToolDefinition(
        tool_id="journey.read_state",
        description="Read owned journey instance state",
        input_schema={"type": "object", "required": ["journey_instance_id"], "properties": {"journey_instance_id": {"type": "integer"}}},
        output_schema={"type": "object"},
        risk="READ_PRIVATE",
        auth_required=False,
        permission="journey.read",
        side_effect="read",
        idempotent=True,
        requires_confirmation=False,
        owner="jos",
    ),
    "service_request.read_current_user": ToolDefinition(
        tool_id="service_request.read_current_user",
        description="List service requests for authenticated user",
        input_schema={"type": "object", "properties": {}},
        output_schema={"type": "object", "properties": {"items": {"type": "array"}}},
        risk="READ_PRIVATE",
        auth_required=True,
        permission="service_request.read_own",
        side_effect="read",
        idempotent=True,
        requires_confirmation=False,
        owner="service_requests",
    ),
    "service_request.read_detail": ToolDefinition(
        tool_id="service_request.read_detail",
        description="Read one owned service request detail",
        input_schema={"type": "object", "required": ["service_request_id"], "properties": {"service_request_id": {"type": "integer"}}},
        output_schema={"type": "object"},
        risk="READ_PRIVATE",
        auth_required=True,
        permission="service_request.read_own",
        side_effect="read",
        idempotent=True,
        requires_confirmation=False,
        owner="service_requests",
    ),
    "human_handoff.request": ToolDefinition(
        tool_id="human_handoff.request",
        description="Request human professional handoff with conversation context",
        input_schema={
            "type": "object",
            "required": ["reason"],
            "properties": {
                "reason": {"type": "string"},
                "conversation_summary": {"type": "string"},
                "journey_instance_id": {"type": "integer"},
                "service_request_id": {"type": "integer"},
            },
        },
        output_schema={"type": "object"},
        risk="WRITE_REVERSIBLE",
        auth_required=False,
        permission="human_handoff.request",
        side_effect="write",
        idempotent=False,
        requires_confirmation=True,
        owner="operations",
    ),
}


def get_tool(tool_id: str) -> ToolDefinition:
    try:
        return TOOL_REGISTRY[tool_id]
    except KeyError as exc:
        raise KeyError(f"Unknown tool_id: {tool_id}") from exc
