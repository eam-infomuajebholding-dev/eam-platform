"""Fast deterministic eval baseline for intent routing (no live model)."""

from __future__ import annotations

from services.ai.intent_router import route_intent_deterministic
from tests.ai_eval.intent_golden_set import (
    EXPECTED_CLARIFY,
    EXPECTED_NONE,
    EXPECTED_START,
    GOLDEN_SET,
    UNSUPPORTED_JOURNEY_TYPES,
)


def _classify(message: str) -> tuple[str, str | None]:
    decision = route_intent_deterministic(message, None)
    if decision is None:
        return EXPECTED_NONE, None
    if decision.action == "clarify":
        return EXPECTED_CLARIFY, None
    if decision.action == "start_journey":
        return EXPECTED_START, decision.candidate_journey
    return EXPECTED_NONE, decision.candidate_journey


def _compute_metrics():
    total = len(GOLDEN_SET)
    correct = 0
    false_journey_starts = 0
    unsupported_journey_starts = 0
    clarification_count = 0
    incorrect = []

    for case in GOLDEN_SET:
        actual_action, actual_journey = _classify(case.message)
        if case.expected == EXPECTED_CLARIFY and actual_action == EXPECTED_CLARIFY:
            correct += 1
            clarification_count += 1
            continue
        if case.expected == EXPECTED_NONE:
            if actual_action != EXPECTED_START:
                correct += 1
            else:
                incorrect.append((case.message, case.expected, actual_action, actual_journey))
                if actual_journey in {case.expected_journey}:
                    false_journey_starts += 1
                if actual_journey in UNSUPPORTED_JOURNEY_TYPES:
                    unsupported_journey_starts += 1
            continue
        if case.expected == EXPECTED_START:
            if actual_action == EXPECTED_START and actual_journey == case.expected_journey:
                correct += 1
            else:
                incorrect.append((case.message, case.expected_journey, actual_action, actual_journey))
                if actual_action == EXPECTED_START and actual_journey != case.expected_journey:
                    false_journey_starts += 1
                if actual_journey in UNSUPPORTED_JOURNEY_TYPES:
                    unsupported_journey_starts += 1

    supported_cases = [c for c in GOLDEN_SET if c.expected == EXPECTED_START]
    supported_hits = sum(
        1
        for case in supported_cases
        if _classify(case.message) == (EXPECTED_START, case.expected_journey)
    )

    return {
        "TOTAL_CASES": total,
        "CORRECT": correct,
        "INCORRECT": total - correct,
        "FALSE_JOURNEY_STARTS": false_journey_starts,
        "FALSE_JOURNEY_START_RATE": false_journey_starts / total,
        "UNSUPPORTED_JOURNEY_STARTS": unsupported_journey_starts,
        "CLARIFICATION_COUNT": clarification_count,
        "SUPPORTED_INTENT_ACCURACY": supported_hits / len(supported_cases) if supported_cases else 1.0,
        "incorrect": incorrect,
    }


def test_intent_eval_golden_set_metrics():
    metrics = _compute_metrics()
    assert metrics["UNSUPPORTED_JOURNEY_STARTS"] == 0
    assert metrics["FALSE_JOURNEY_STARTS"] <= 1, metrics
    assert metrics["CORRECT"] / metrics["TOTAL_CASES"] >= 0.85, metrics
    assert metrics["SUPPORTED_INTENT_ACCURACY"] >= 0.95, metrics


def test_ambiguous_project_prompts_clarification():
    decision = route_intent_deterministic("عندي مشروع", None)
    assert decision is not None
    assert decision.action == "clarify"
