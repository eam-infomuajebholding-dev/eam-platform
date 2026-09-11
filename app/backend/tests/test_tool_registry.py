"""Tool registry metadata tests (WO-006 STREAM E)."""

from __future__ import annotations

import pytest

from services.ai.tool_registry import TOOL_REGISTRY, ToolDefinition, get_tool

FORBIDDEN_TOOL_IDS = frozenset(
    {
        "execute_api",
        "database_query",
        "run_sql",
        "arbitrary_http",
        "arbitrary_python",
    }
)

REQUIRED_DESCRIPTOR_ATTRS = (
    "tool_id",
    "description",
    "input_schema",
    "output_schema",
    "risk",
    "auth_required",
    "permission",
    "side_effect",
    "idempotent",
    "requires_confirmation",
    "owner",
)


def test_registry_contains_initial_safe_tools():
    expected = {
        "journey.start",
        "journey.resume",
        "journey.read_state",
        "service_request.read_current_user",
        "service_request.read_detail",
        "human_handoff.request",
    }
    assert expected == set(TOOL_REGISTRY.keys())


def test_no_forbidden_generic_tools_registered():
    assert FORBIDDEN_TOOL_IDS.isdisjoint(set(TOOL_REGISTRY.keys()))


@pytest.mark.parametrize("tool_id", list(TOOL_REGISTRY.keys()))
def test_tool_descriptor_contract(tool_id: str):
    tool = get_tool(tool_id)
    assert isinstance(tool, ToolDefinition)
    for attr in REQUIRED_DESCRIPTOR_ATTRS:
        assert getattr(tool, attr) is not None or attr == "requires_confirmation"
    assert tool.input_schema.get("type") == "object"
    assert tool.tool_id == tool_id


def test_unknown_tool_raises():
    with pytest.raises(KeyError, match="Unknown tool_id"):
        get_tool("does.not.exist")
