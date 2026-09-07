"""Tests for AI Core workspace (WO-004)."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from schemas.ai_core import WorkspaceTurnRequest
from services.ai_core import AICoreService
from services.ai_core_intents import (
    BUILD_VILLA_JOURNEY_TYPE,
    BUILD_VILLA_QUICK_ACTION_LABEL,
    classify_build_villa_deterministic,
)


def test_quick_action_label_is_build_villa_deterministic():
    assert classify_build_villa_deterministic(BUILD_VILLA_QUICK_ACTION_LABEL) is True


def test_arabic_free_text_build_villa_examples():
    examples = [
        "أريد بناء فيلا في جدة",
        "أبغى أبني بيت",
        "أريد بناء منزل",
        "ابني فيلا في الرياض",
    ]
    for message in examples:
        assert classify_build_villa_deterministic(message) is True, message


def test_general_question_is_not_build_villa():
    assert classify_build_villa_deterministic("ما هي خدماتكم الهندسية؟") is False
    assert classify_build_villa_deterministic("كيف أتواصل معكم؟") is False


@pytest.mark.asyncio
async def test_deterministic_handoff_action_contract():
    service = AICoreService()
    response = await service.handle_turn(
        WorkspaceTurnRequest(message=BUILD_VILLA_QUICK_ACTION_LABEL, intent_hint=BUILD_VILLA_JOURNEY_TYPE)
    )
    assert response.action == "start_journey"
    assert response.journey_type == BUILD_VILLA_JOURNEY_TYPE
    assert response.assistant_message


@pytest.mark.asyncio
async def test_arabic_free_text_start_journey_without_llm():
    service = AICoreService()
    response = await service.handle_turn(WorkspaceTurnRequest(message="أريد بناء فيلا في جدة"))
    assert response.action == "start_journey"
    assert response.journey_type == BUILD_VILLA_JOURNEY_TYPE


@pytest.mark.asyncio
async def test_general_faq_does_not_start_journey():
    service = AICoreService()
    with patch.object(service, "is_ai_available", return_value=True):
        with patch.object(service, "_general_answer", AsyncMock(return_value="خدماتنا الهندسية متنوعة.")):
            response = await service.handle_turn(
                WorkspaceTurnRequest(message="ما هي خدماتكم الهندسية؟")
            )
    assert response.action == "general_answer"
    assert response.journey_type is None


@pytest.mark.asyncio
async def test_ai_unavailable_for_general_question():
    service = AICoreService()
    with patch.object(service, "is_ai_available", return_value=False):
        response = await service.handle_turn(
            WorkspaceTurnRequest(message="ما هي ساعات العمل؟")
        )
    assert response.action == "ai_unavailable"
    assert response.ai_available is False


@pytest.mark.asyncio
async def test_build_villa_still_works_when_ai_unavailable():
    service = AICoreService()
    with patch.object(service, "is_ai_available", return_value=False):
        response = await service.handle_turn(
            WorkspaceTurnRequest(message="أبغى أبني بيت", intent_hint=BUILD_VILLA_JOURNEY_TYPE)
        )
    assert response.action == "start_journey"
    assert response.journey_type == BUILD_VILLA_JOURNEY_TYPE
