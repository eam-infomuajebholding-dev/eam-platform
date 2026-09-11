from typing import Any

from pydantic import BaseModel, Field


class ToolExecuteRequest(BaseModel):
    tool_id: str
    payload: dict[str, Any] = Field(default_factory=dict)
    confirmation_present: bool = False
    trace_id: str | None = None


class ToolExecuteResponse(BaseModel):
    tool_id: str
    trace_id: str
    status: str
    data: dict[str, Any] | None = None
    safe_message: str | None = None
    error_code: str | None = None
    audit_reference: str | None = None
