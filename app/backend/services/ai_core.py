"""Thin AI Core intelligence layer for the homepage workspace."""

from __future__ import annotations

import json
import logging
import re
from typing import AsyncGenerator

from schemas.ai_core import JourneySnapshot, WorkspaceTurnRequest, WorkspaceTurnResponse
from schemas.aihub import ChatMessage, GenTxtRequest
from services.ai.intent_router import (
    BUILD_VILLA_START_MESSAGE,
    classifier_system_prompt,
    parse_model_intent_decision,
    route_intent_deterministic,
)
from services.ai.prompt_registry import EXECUTIVE_BRIEF, FAQ_SYSTEM
from services.ai.ai_trace import ai_trace
from services.ai.response_builder import build_workspace_response, new_trace_id
from services.ai_core_intents import BUILD_VILLA_JOURNEY_TYPE
from services.aihub import AIHubService

logger = logging.getLogger(__name__)

FAQ_SYSTEM_PROMPT = FAQ_SYSTEM.content
JOURNEY_GUIDANCE_FALLBACK = "تابع الإجابة على السؤال الحالي لإكمال رحلة جمع المعلومات."


class AIUnavailableError(RuntimeError):
    """Raised when AI Hub is not configured."""


class AICoreService:
    """Intelligence layer: intent classification and conversational prose only."""

    def __init__(self) -> None:
        self.ai_hub = AIHubService()

    def is_ai_available(self) -> bool:
        return self.ai_hub.client is not None

    async def handle_turn(self, request: WorkspaceTurnRequest) -> WorkspaceTurnResponse:
        trace_id = new_trace_id()
        with ai_trace(trace_id, "workspace.turn") as trace:
            return await self._handle_turn_inner(request, trace)

    async def _handle_turn_inner(self, request: WorkspaceTurnRequest, trace) -> WorkspaceTurnResponse:
        if request.mode == "faq":
            if not self.is_ai_available():
                trace.error_code = "AI_NOT_CONFIGURED"
                return build_workspace_response(
                    trace_id=trace.trace_id,
                    action="ai_unavailable",
                    assistant_message="خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى التواصل معنا مباشرة.",
                    ai_available=False,
                    stream=False,
                )
            if request.stream:
                return build_workspace_response(
                    trace_id=trace.trace_id,
                    action="general_answer",
                    assistant_message="",
                    ai_available=True,
                    stream=True,
                )
            answer = await self._general_answer(request.message)
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="general_answer",
                assistant_message=answer,
                ai_available=True,
                stream=False,
            )

        if request.journey_snapshot and request.journey_snapshot.status == "active":
            response = await self._journey_guidance(request.message, request.journey_snapshot)
            response.trace_id = response.trace_id or trace.trace_id
            return response

        deterministic = route_intent_deterministic(request.message, request.intent_hint)
        if deterministic and deterministic.action == "start_journey" and deterministic.candidate_journey:
            trace.intent = deterministic.intent
            trace.confidence = deterministic.confidence
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="start_journey",
                journey_type=deterministic.candidate_journey,
                assistant_message=deterministic.assistant_message or BUILD_VILLA_START_MESSAGE,
                ai_available=self.is_ai_available(),
                stream=False,
                intent=deterministic,
            )

        if not self.is_ai_available():
            unavailable_message = (
                "خدمة الذكاء الاصطناعي غير متاحة حالياً. "
                "يمكنك بدء رحلة بناء الفيلا من الزر السريع «أبني منزلًا»."
            )
            trace.error_code = "AI_NOT_CONFIGURED"
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="ai_unavailable",
                assistant_message=unavailable_message,
                ai_available=False,
                stream=False,
            )

        decision = await self._classify_free_text_intent(request.message)
        trace.intent = decision.intent
        trace.confidence = decision.confidence
        if decision.action == "start_journey" and decision.candidate_journey:
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="start_journey",
                journey_type=decision.candidate_journey,
                assistant_message=decision.assistant_message or BUILD_VILLA_START_MESSAGE,
                ai_available=True,
                stream=False,
                intent=decision,
            )
        if decision.action == "clarify" and decision.assistant_message:
            trace.fallback = True
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="general_answer",
                assistant_message=decision.assistant_message,
                ai_available=True,
                stream=False,
                intent=decision,
            )

        if request.stream:
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="general_answer",
                assistant_message="",
                ai_available=True,
                stream=True,
            )

        answer = await self._general_answer(request.message)
        return build_workspace_response(
            trace_id=trace.trace_id,
            action="general_answer",
            assistant_message=answer,
            ai_available=True,
            stream=request.stream,
        )

    async def stream_general_answer(self, message: str) -> AsyncGenerator[str, None]:
        if not self.is_ai_available():
            yield (
                "خدمة الذكاء الاصطناعي غير متاحة حالياً. "
                "يمكنك بدء رحلة بناء الفيلا من الزر السريع «أبني منزلًا»."
            )
            return

        request = GenTxtRequest(
            messages=[
                ChatMessage(role="system", content=FAQ_SYSTEM_PROMPT),
                ChatMessage(role="user", content=message),
            ],
            model="deepseek-v3.2",
            stream=True,
            temperature=0.4,
            max_tokens=800,
        )
        async for chunk in self.ai_hub.gentxt_stream(request):
            yield chunk

    async def _classify_free_text_intent(self, message: str):
        from schemas.ai_intent import IntentDecision

        request = GenTxtRequest(
            messages=[
                ChatMessage(role="system", content=classifier_system_prompt()),
                ChatMessage(role="user", content=message),
            ],
            model="deepseek-v3.2",
            stream=False,
            temperature=0.0,
            max_tokens=120,
        )
        try:
            response = await self.ai_hub.gentxt(request)
            payload = self._parse_classifier_json(response.content)
            return parse_model_intent_decision(payload)
        except Exception as exc:
            logger.warning("AI Core classifier failed; defaulting to general: %s", exc)
        return IntentDecision(intent="general", confidence=0.0, action="general_answer")

    async def _general_answer(self, message: str) -> str:
        request = GenTxtRequest(
            messages=[
                ChatMessage(role="system", content=FAQ_SYSTEM_PROMPT),
                ChatMessage(role="user", content=message),
            ],
            model="deepseek-v3.2",
            stream=False,
            temperature=0.4,
            max_tokens=800,
        )
        response = await self.ai_hub.gentxt(request)
        return response.content.strip()

    async def _journey_guidance(self, message: str, snapshot: JourneySnapshot) -> WorkspaceTurnResponse:
        if not self.is_ai_available():
            return build_workspace_response(
                action="journey_guidance",
                journey_type=snapshot.journey_type,
                assistant_message=JOURNEY_GUIDANCE_FALLBACK,
                ai_available=False,
                stream=False,
            )

        prompt = (
            "Provide a short Arabic guidance message for the user in an active intake journey. "
            "Do NOT validate fields, change steps, or invent business data. "
            f"Journey type: {snapshot.journey_type}. "
            f"Current step: {snapshot.current_step_key}. "
            f"Collected context (read-only): {json.dumps(snapshot.context, ensure_ascii=False)}. "
            f"User message: {message}"
        )
        request = GenTxtRequest(
            messages=[
                ChatMessage(role="system", content=FAQ_SYSTEM_PROMPT),
                ChatMessage(role="user", content=prompt),
            ],
            model="deepseek-v3.2",
            stream=False,
            temperature=0.3,
            max_tokens=300,
        )
        try:
            response = await self.ai_hub.gentxt(request)
            message_text = response.content.strip() or JOURNEY_GUIDANCE_FALLBACK
        except Exception as exc:
            logger.warning("Journey guidance failed: %s", exc)
            message_text = JOURNEY_GUIDANCE_FALLBACK

        return build_workspace_response(
            action="journey_guidance",
            journey_type=snapshot.journey_type,
            assistant_message=message_text,
            ai_available=True,
            stream=False,
        )

    async def generate_executive_analysis(self, context: dict, question: str | None = None) -> dict:
        """Structured executive analysis from permission-filtered Command Center context."""
        if not self.is_ai_available():
            raise AIUnavailableError("AI provider not configured")

        user_prompt = (
            f"Authorized executive context (aggregate only):\n{json.dumps(context, ensure_ascii=False)}\n\n"
            f"Executive question: {question or 'WHAT CHANGED? WHAT MATTERS? WHAT NEEDS DECISION? WHAT TO WATCH?'}"
        )
        request = GenTxtRequest(
            messages=[
                ChatMessage(role="system", content=EXECUTIVE_BRIEF.content),
                ChatMessage(role="user", content=user_prompt),
            ],
            model="deepseek-v3.2",
            stream=False,
            temperature=0.2,
            max_tokens=1200,
        )
        response = await self.ai_hub.gentxt(request)
        return self._parse_executive_json(response.content)

    @staticmethod
    def _parse_executive_json(content: str) -> dict:
        text = (content or "").strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
        parsed = json.loads(text)
        if not isinstance(parsed, dict):
            raise ValueError("Executive AI response must be a JSON object")
        for key in ("facts", "recommendations", "decisions_needed", "watch_next", "what_changed", "what_matters", "why", "limitations"):
            raw = parsed.get(key, [])
            if isinstance(raw, list) and raw and isinstance(raw[0], dict):
                parsed[key] = [str(item.get("text", item)) for item in raw]
        return parsed

    @staticmethod
    def _parse_classifier_json(content: str) -> dict:
        text = (content or "").strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
        return json.loads(text)
