"""Canonical AI Core contract types (versioned, machine-consumable)."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

AI_CONTRACT_VERSION = "1.1.0"

AIErrorCode = Literal[
    "AI_NOT_CONFIGURED",
    "AI_PROVIDER_TIMEOUT",
    "AI_PROVIDER_RATE_LIMITED",
    "AI_INVALID_STRUCTURED_OUTPUT",
    "AI_LOW_CONFIDENCE",
    "AI_POLICY_BLOCKED",
    "AI_TOOL_UNAUTHORIZED",
    "AI_TOOL_FAILED",
    "AI_RETRIEVAL_FAILED",
    "AI_CONTEXT_FORBIDDEN",
    "AI_BUDGET_EXCEEDED",
]

AIActionType = Literal[
    "ANSWER",
    "ASK_CLARIFICATION",
    "START_JOURNEY",
    "RESUME_JOURNEY",
    "SHOW_FIRST_VALUE",
    "OPEN_RESOURCE",
    "REQUEST_HUMAN_HANDOFF",
    "JOURNEY_GUIDANCE",
]


class AIError(BaseModel):
    code: AIErrorCode
    message: str
    user_message: str
    retryable: bool = False


class AIActionProposal(BaseModel):
    action: AIActionType
    journey_type: str | None = None
    resource_ref: str | None = None
    parameters: dict[str, Any] = Field(default_factory=dict)
    side_effect: Literal["none", "read", "write"] = "none"


class AIMessage(BaseModel):
    role: Literal["assistant"] = "assistant"
    content: str
    preliminary: bool = False


class ResponseIntent(BaseModel):
    intent: str
    confidence: float = Field(ge=0.0, le=1.0)
    candidate_journey: str | None = None


class AIUsageMetadata(BaseModel):
    model_class: str | None = None
    prompt_id: str | None = None
    prompt_version: str | None = None
    latency_ms: int | None = None
