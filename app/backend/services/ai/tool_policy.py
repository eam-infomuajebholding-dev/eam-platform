"""Deterministic AI tool authorization boundary."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from services.ai.tool_registry import ToolDefinition, get_tool

logger = logging.getLogger(__name__)


@dataclass
class ToolAuthorizationResult:
    allowed: bool
    reason: str
    requires_confirmation: bool = False


@dataclass
class ToolAuditRecord:
    trace_id: str
    tool_id: str
    authorization_result: str
    execution_result: str
    duration_ms: int | None = None
    business_reference: str | None = None
    risk_class: str | None = None
    confirmation_result: str | None = None


def authorize_tool_proposal(
    tool_id: str,
    *,
    is_authenticated: bool,
    granted_permissions: set[str] | None = None,
) -> ToolAuthorizationResult:
    try:
        tool = get_tool(tool_id)
    except KeyError:
        return ToolAuthorizationResult(allowed=False, reason="UNKNOWN_TOOL")

    if tool.auth_required and not is_authenticated:
        return ToolAuthorizationResult(allowed=False, reason="AUTH_REQUIRED")

    permissions = granted_permissions or set()
    if tool.permission not in permissions and tool.auth_required:
        return ToolAuthorizationResult(allowed=False, reason="PERMISSION_DENIED")

    if tool.side_effect == "write" and tool.requires_confirmation:
        return ToolAuthorizationResult(
            allowed=True,
            reason="CONFIRMATION_REQUIRED",
            requires_confirmation=True,
        )

    return ToolAuthorizationResult(allowed=True, reason="ALLOWED")


def can_execute_tool(
    tool_id: str,
    *,
    is_authenticated: bool,
    granted_permissions: set[str] | None = None,
    confirmation_present: bool = False,
) -> ToolAuthorizationResult:
    """Gate execution after authorization — write tools needing confirmation cannot run without it."""
    auth = authorize_tool_proposal(
        tool_id,
        is_authenticated=is_authenticated,
        granted_permissions=granted_permissions,
    )
    if not auth.allowed:
        return auth
    if auth.requires_confirmation and not confirmation_present:
        return ToolAuthorizationResult(allowed=False, reason="CONFIRMATION_MISSING")
    return ToolAuthorizationResult(allowed=True, reason="ALLOWED")


def validate_tool_input(tool: ToolDefinition, payload: dict[str, Any]) -> bool:
    if not isinstance(payload, dict):
        return False
    for required in tool.input_schema.get("required", []):
        if required not in payload:
            return False
    return True


def record_tool_audit(record: ToolAuditRecord) -> None:
    logger.info(
        "ai_tool_audit trace_id=%s tool_id=%s risk=%s auth=%s confirm=%s result=%s duration_ms=%s ref=%s",
        record.trace_id,
        record.tool_id,
        record.risk_class,
        record.authorization_result,
        record.confirmation_result,
        record.execution_result,
        record.duration_ms,
        record.business_reference,
    )
