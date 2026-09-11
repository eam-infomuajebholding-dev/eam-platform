"""Deterministic intent routing tests."""

from services.ai.intent_router import (
    classify_engineering_consulting_deterministic,
    parse_model_intent_decision,
    route_intent_deterministic,
)
from services.ai_core_intents import BUILD_VILLA_JOURNEY_TYPE, ENGINEERING_CONSULTING_JOURNEY_TYPE


def test_route_build_villa_quick_action():
    decision = route_intent_deterministic("أبني منزلًا", None)
    assert decision is not None
    assert decision.candidate_journey == BUILD_VILLA_JOURNEY_TYPE
    assert decision.action == "start_journey"


def test_route_engineering_consulting_phrase():
    assert classify_engineering_consulting_deterministic("أريد استشارة هندسية لمشروعي", None)
    decision = route_intent_deterministic("أريد استشارة هندسية لمشروعي", None)
    assert decision is not None
    assert decision.candidate_journey == ENGINEERING_CONSULTING_JOURNEY_TYPE


def test_parse_model_low_confidence_clarifies():
    decision = parse_model_intent_decision({"intent": "general", "confidence": 0.2})
    assert decision.action == "clarify"
    assert decision.assistant_message


def test_parse_model_build_villa_high_confidence():
    decision = parse_model_intent_decision({"intent": "build_villa", "confidence": 0.85})
    assert decision.candidate_journey == BUILD_VILLA_JOURNEY_TYPE
    assert decision.action == "start_journey"
