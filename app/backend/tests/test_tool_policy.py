"""Tool policy authorization tests (WO-006 STREAM E)."""

from __future__ import annotations

import logging

from services.ai.tool_policy import (
    ToolAuditRecord,
    authorize_tool_proposal,
    can_execute_tool,
    record_tool_audit,
    validate_tool_input,
)
from services.ai.tool_registry import get_tool


def test_unknown_tool_denied():
    result = authorize_tool_proposal("unknown.tool", is_authenticated=True)
    assert result.allowed is False
    assert result.reason == "UNKNOWN_TOOL"


def test_read_tool_allowed_anonymously():
    result = authorize_tool_proposal("journey.read_state", is_authenticated=False)
    assert result.allowed is True
    assert result.reason == "ALLOWED"


def test_write_tool_requires_confirmation():
    result = authorize_tool_proposal("journey.start", is_authenticated=False)
    assert result.allowed is True
    assert result.requires_confirmation is True
    assert result.reason == "CONFIRMATION_REQUIRED"


def test_authenticated_sr_read_requires_permission():
    result = authorize_tool_proposal(
        "service_request.read_current_user",
        is_authenticated=True,
        granted_permissions=set(),
    )
    assert result.allowed is False
    assert result.reason == "PERMISSION_DENIED"


def test_sr_read_allowed_with_permission():
    result = authorize_tool_proposal(
        "service_request.read_detail",
        is_authenticated=True,
        granted_permissions={"service_request.read_own"},
    )
    assert result.allowed is True


def test_invalid_tool_input_rejected():
    tool = get_tool("journey.start")
    assert validate_tool_input(tool, {}) is False
    assert validate_tool_input(tool, {"journey_type": "build_villa"}) is True


def test_human_confirmation_contract():
    blocked = can_execute_tool("journey.start", is_authenticated=False, confirmation_present=False)
    assert blocked.allowed is False
    assert blocked.reason == "CONFIRMATION_MISSING"

    allowed = can_execute_tool("journey.start", is_authenticated=False, confirmation_present=True)
    assert allowed.allowed is True


def test_audit_log_does_not_include_secrets(caplog):
    caplog.set_level(logging.INFO)
    record_tool_audit(
        ToolAuditRecord(
            trace_id="trace-1",
            tool_id="journey.read_state",
            authorization_result="ALLOWED",
            execution_result="SUCCESS",
            business_reference="instance:42",
        )
    )
    assert "trace-1" in caplog.text
    assert "password" not in caplog.text.lower()
