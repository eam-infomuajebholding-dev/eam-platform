"""Smoke tests for open copilot + conversation history (implementation verification)."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
from schemas.ai_core import ConversationMessage, WorkspaceTurnRequest
from schemas.ai_intent import IntentDecision
from services.ai_core import AICoreService, _chat_messages_for_request
from services.ai_core_intents import BUILD_VILLA_JOURNEY_TYPE, BUILD_VILLA_QUICK_ACTION_LABEL


def test_conversation_history_reaches_model_messages():
    request = WorkspaceTurnRequest(
        message="وماذا عن التكلفة؟",
        conversation_history=[
            ConversationMessage(role="user", content="أفكر ببناء فيلا"),
            ConversationMessage(role="assistant", content="جميل — ما المدينة؟"),
        ],
    )
    messages = _chat_messages_for_request(request)
    roles = [m.role for m in messages]
    assert roles[0] == "system"
    assert roles[-1] == "user"
    assert any("أفكر ببناء فيلا" in m.content for m in messages if m.role == "user")


@pytest.mark.asyncio
async def test_explicit_intent_hint_still_starts_journey():
    service = AICoreService()
    response = await service.handle_turn(
        WorkspaceTurnRequest(
            message="أريد البدء",
            intent_hint=BUILD_VILLA_JOURNEY_TYPE,
        )
    )
    assert response.action == "start_journey"
    assert response.journey_type == BUILD_VILLA_JOURNEY_TYPE


@pytest.mark.asyncio
async def test_quick_action_label_starts_journey():
    service = AICoreService()
    response = await service.handle_turn(WorkspaceTurnRequest(message=BUILD_VILLA_QUICK_ACTION_LABEL))
    assert response.action == "start_journey"
    assert response.journey_type == BUILD_VILLA_JOURNEY_TYPE


@pytest.mark.asyncio
async def test_api_accepts_conversation_history_json():
    transport = ASGITransport(app=app)
    with patch.object(AICoreService, "is_ai_available", return_value=True):
        with patch.object(
            AICoreService,
            "_classify_free_text_intent",
            AsyncMock(return_value=IntentDecision(intent="general", confidence=0.1, action="general_answer")),
        ):
            with patch.object(
                AICoreService,
                "stream_general_answer",
                AsyncMock(return_value=_async_gen("رد تجريبي")),
            ):
                async with AsyncClient(transport=transport, base_url="http://test") as client:
                    turn = await client.post(
                        "/api/v1/ai-core/workspace/turn",
                        json={
                            "message": "تابع",
                            "stream": True,
                            "conversation_history": [
                                {"role": "user", "content": "مرحبا"},
                                {"role": "assistant", "content": "أهلاً"},
                            ],
                        },
                    )
                    assert turn.status_code == 200
                    body = turn.json()
                    assert body["action"] == "general_answer"
                    assert body.get("stream") is True


async def _async_gen(text: str):
    yield text
