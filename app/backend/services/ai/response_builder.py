"""Build versioned AI Core workspace responses with structured actions."""

from __future__ import annotations

import uuid

from schemas.ai_contract import (
    AI_CONTRACT_VERSION,
    AIActionProposal,
    AIActionType,
    AIError,
    AIMessage,
    ResponseIntent,
)
from schemas.ai_core import WorkspaceAction, WorkspaceTurnResponse
from schemas.ai_intent import IntentDecision


def new_trace_id() -> str:
    return str(uuid.uuid4())


def _action_proposals_for_turn(
    action: WorkspaceAction,
    journey_type: str | None,
) -> list[AIActionProposal]:
    if action == "start_journey" and journey_type:
        return [
            AIActionProposal(
                action="START_JOURNEY",
                journey_type=journey_type,
                side_effect="write",
            )
        ]
    if action == "general_answer":
        return [AIActionProposal(action="ANSWER", side_effect="none")]
    if action == "journey_guidance" and journey_type:
        return [
            AIActionProposal(
                action="JOURNEY_GUIDANCE",
                journey_type=journey_type,
                side_effect="none",
            )
        ]
    if action == "ai_unavailable":
        return [AIActionProposal(action="ANSWER", side_effect="none")]
    return []


def intent_from_decision(decision: IntentDecision | None) -> ResponseIntent | None:
    if decision is None:
        return None
    return ResponseIntent(
        intent=decision.intent,
        confidence=decision.confidence,
        candidate_journey=decision.candidate_journey,
    )


def build_workspace_response(
    *,
    action: WorkspaceAction,
    assistant_message: str,
    journey_type: str | None = None,
    ai_available: bool = True,
    stream: bool = False,
    intent: IntentDecision | None = None,
    trace_id: str | None = None,
    error: AIError | None = None,
    requires_confirmation: bool = False,
) -> WorkspaceTurnResponse:
    resolved_trace = trace_id or new_trace_id()
    response_intent = intent_from_decision(intent)
    if intent is not None:
        requires_confirmation = requires_confirmation or intent.required_confirmation

    if action == "ai_unavailable" and error is None:
        error = AIError(
            code="AI_NOT_CONFIGURED",
            message="AI Hub client is not configured",
            user_message=assistant_message,
            retryable=False,
        )

    mapped_action: AIActionType = "ANSWER"
    if action == "start_journey":
        mapped_action = "START_JOURNEY"
    elif action == "journey_guidance":
        mapped_action = "JOURNEY_GUIDANCE"
    elif intent is not None and intent.action == "clarify":
        mapped_action = "ASK_CLARIFICATION"

    actions = _action_proposals_for_turn(action, journey_type)
    if not actions:
        actions = [AIActionProposal(action=mapped_action, journey_type=journey_type, side_effect="none")]

    return WorkspaceTurnResponse(
        action=action,
        journey_type=journey_type,
        assistant_message=assistant_message,
        ai_available=ai_available,
        stream=stream,
        contract_version=AI_CONTRACT_VERSION,
        trace_id=resolved_trace,
        message=AIMessage(content=assistant_message),
        intent=response_intent,
        actions=actions,
        requires_confirmation=requires_confirmation,
        error=error,
    )
