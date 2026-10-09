"""WO-001: server context is authority; the client cannot choose identity or a foreign journey."""

from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from schemas.ai_contract import AI_CONTEXT_CONTRACT_VERSION, AI_CONTRACT_VERSION
from schemas.ai_core import JourneySnapshot, WorkspaceClientHints, WorkspaceTurnRequest
from schemas.ai_intent import IntentDecision
from services.ai.context_engine import ActorBinding, ContextEngine, actor_binding
from services.ai_core import AICoreService


def test_guided_journey_is_build_villa_only():
    flag = Path(__file__).resolve().parents[2] / "frontend" / "src" / "config" / "assistant.ts"
    text = flag.read_text(encoding="utf-8")
    assert "ASSISTANT_GUIDED_JOURNEY_ENABLED = true" in text
    assert "ASSISTANT_GUIDED_JOURNEY_TYPE = 'build_villa'" in text


def test_request_body_cannot_name_the_actor():
    parsed = WorkspaceTurnRequest.model_validate(
        {
            "message": "ما هي خدماتكم الهندسية؟",
            "user_id": "attacker",
            "client_hints": {"surface": "home", "user_id": "attacker"},
        }
    )
    assert parsed.client_hints is not None
    dumped = parsed.model_dump()
    assert "user_id" not in dumped
    assert "user_id" not in dumped["client_hints"]


@pytest.mark.asyncio
async def test_authenticated_actor_ignores_body_user_id():
    parsed = WorkspaceTurnRequest.model_validate(
        {"message": "ما هي خدماتكم الهندسية؟", "user_id": "attacker", "client_hints": {"surface": "home"}}
    )
    actor = ActorBinding(
        user_id="real-user",
        anonymous_session_id=None,
        role="user",
        permissions=frozenset({"journey.read", "service_request.read_own"}),
    )
    context = await ContextEngine(None).build(actor, parsed.client_hints or WorkspaceClientHints())
    assert context.user_id == "real-user"
    assert context.actor_kind == "user"
    assert context.role == "user"
    assert "attacker" not in context.permissions


@pytest.mark.asyncio
async def test_anonymous_session_can_continue_to_the_model():
    actor = actor_binding(None, "anon-session-1")
    context = await ContextEngine(None).build(actor, WorkspaceClientHints(surface="home", route="/"))
    assert context.actor_kind == "anonymous"
    assert context.anonymous_session_id == "anon-session-1"
    assert context.role == ""
    assert context.forbidden is False

    service = AICoreService()
    classify = AsyncMock(return_value=IntentDecision(intent="general", confidence=0.2, action="general_answer"))
    answer = AsyncMock(return_value="خدماتنا الهندسية متنوعة.")
    with patch.object(service, "is_ai_available", return_value=True):
        with patch.object(service, "_classify_free_text_intent", classify):
            with patch.object(service, "_general_answer", answer):
                response = await service.handle_turn(
                    WorkspaceTurnRequest(message="ما هي خدماتكم الهندسية؟", client_hints=WorkspaceClientHints()),
                    actor=actor,
                    db=None,
                    resolved=context,
                )
    assert classify.await_count == 1
    assert answer.await_count == 1
    assert response.action == "general_answer"
    assert response.error is None
    assert response.contract_version == AI_CONTEXT_CONTRACT_VERSION


@pytest.mark.asyncio
async def test_foreign_journey_is_forbidden_before_the_model():
    instance = SimpleNamespace(
        id=9,
        user_id="owner",
        anonymous_session_id="owner-session",
        journey_type="contracting",
        current_step_key="scope",
        status="active",
        context={},
    )
    hints = WorkspaceClientHints(surface="journey", route="/journeys/contracting", journey_instance_id=9)
    actor = actor_binding(None, "intruder-session")
    with patch("services.ai.context_engine.JosService") as jos_cls:
        jos_cls.return_value.get_instance = AsyncMock(return_value=instance)
        context = await ContextEngine(object()).build(actor, hints)

    assert context.forbidden is True
    assert context.journey_type is None

    service = AICoreService()
    service.ai_hub.gentxt = AsyncMock(side_effect=AssertionError("model called"))
    classify = AsyncMock(side_effect=AssertionError("classifier called"))
    with patch.object(service, "is_ai_available", return_value=True):
        with patch.object(service, "_classify_free_text_intent", classify):
            response = await service.handle_turn(
                WorkspaceTurnRequest(message="أكمل رحلتي", client_hints=hints),
                actor=actor,
                db=object(),
                resolved=context,
            )
    assert response.error is not None
    assert response.error.code == "AI_CONTEXT_FORBIDDEN"
    assert response.stream is False
    assert service.ai_hub.gentxt.await_count == 0
    assert classify.await_count == 0


@pytest.mark.asyncio
async def test_route_disagreement_keeps_jos_journey():
    instance = SimpleNamespace(
        id=4,
        user_id="owner",
        anonymous_session_id=None,
        journey_type="contracting",
        current_step_key="scope",
        status="active",
        context={"city": "الرياض"},
    )
    hints = WorkspaceClientHints(
        surface="journey",
        route="/journeys/equipment",
        journey_instance_id=4,
    )
    actor = ActorBinding(user_id="owner", anonymous_session_id=None, role="user", permissions=frozenset())
    with patch("services.ai.context_engine.JosService") as jos_cls:
        jos_cls.return_value.get_instance = AsyncMock(return_value=instance)
        jos_cls.return_value._get_service_request_id = AsyncMock(return_value=None)
        context = await ContextEngine(object()).build(actor, hints)

    assert context.conflict is True
    assert context.journey_type == "contracting"
    assert context.forbidden is False

    service = AICoreService()
    service.ai_hub.gentxt = AsyncMock(side_effect=AssertionError("model called"))
    with patch.object(service, "is_ai_available", return_value=False):
        open_chat = await service.handle_turn(
            WorkspaceTurnRequest(message="ما هي خدماتكم الهندسية؟", client_hints=hints),
            actor=actor,
            db=object(),
            resolved=context,
        )
        guided = await service.handle_turn(
            WorkspaceTurnRequest(
                message="ماذا بعد؟",
                client_hints=hints,
                journey_snapshot=JourneySnapshot(
                    journey_instance_id=4,
                    journey_type="equipment",
                    current_step_key="client-step",
                    status="active",
                    context={"forged": True},
                ),
            ),
            actor=actor,
            db=object(),
            resolved=context,
        )
    assert open_chat.action == "ai_unavailable"
    assert open_chat.action != "journey_guidance"
    assert guided.action == "journey_guidance"
    assert guided.journey_type == "contracting"
    assert guided.contract_version == AI_CONTEXT_CONTRACT_VERSION
    assert service.ai_hub.gentxt.await_count == 0


def test_legacy_turn_stays_on_contract_1_1():
    request = WorkspaceTurnRequest(message="مرحبا")
    assert request.client_hints is None
    assert AI_CONTRACT_VERSION == "1.1.0"
