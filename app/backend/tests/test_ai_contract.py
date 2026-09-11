"""AI Core contract v1.1 tests."""

from schemas.ai_contract import AI_CONTRACT_VERSION
from schemas.ai_intent import IntentDecision
from services.ai.response_builder import build_workspace_response


def test_workspace_response_includes_contract_version_and_trace():
    response = build_workspace_response(
        action="general_answer",
        assistant_message="مرحباً",
        ai_available=True,
    )
    assert response.contract_version == AI_CONTRACT_VERSION
    assert response.trace_id
    assert response.message is not None
    assert response.message.content == "مرحباً"
    assert response.actions
    assert response.actions[0].action == "ANSWER"


def test_start_journey_structured_actions():
    decision = IntentDecision(
        intent="build_villa",
        confidence=1.0,
        candidate_journey="build_villa",
        action="start_journey",
    )
    response = build_workspace_response(
        action="start_journey",
        journey_type="build_villa",
        assistant_message="لنبدأ",
        intent=decision,
    )
    assert response.action == "start_journey"
    assert response.intent is not None
    assert response.intent.intent == "build_villa"
    assert response.actions[0].action == "START_JOURNEY"
    assert response.actions[0].journey_type == "build_villa"


def test_ai_unavailable_error_taxonomy():
    response = build_workspace_response(
        action="ai_unavailable",
        assistant_message="غير متاح",
        ai_available=False,
    )
    assert response.error is not None
    assert response.error.code == "AI_NOT_CONFIGURED"
    assert response.error.user_message == "غير متاح"
