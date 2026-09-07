"""Thin AI Core intelligence layer for the homepage workspace."""

from __future__ import annotations

import json
import logging
import re
from typing import AsyncGenerator

from schemas.ai_core import JourneySnapshot, WorkspaceTurnRequest, WorkspaceTurnResponse
from schemas.aihub import ChatMessage, GenTxtRequest
from services.ai_core_intents import (
    BUILD_VILLA_JOURNEY_TYPE,
    classify_build_villa_deterministic,
    resolve_intent_hint,
)
from services.aihub import AIHubService

logger = logging.getLogger(__name__)

FAQ_SYSTEM_PROMPT = """أنت مساعد ذكي لشركة إعمار الأصالة والمعاصرة للاستشارات الهندسية (EAM).
أجب على استفسارات العملاء بشكل مهني ومختصر باللغة العربية.
لا تختلق معلومات. إذا لم تعرف الإجابة، اقترح التواصل مع الشركة مباشرة.
لا تبدأ رحلات تشغيلية ولا تجمع بيانات مشروع — هذا دور نظام الرحلات (JOS) وليس دورك."""

CLASSIFIER_SYSTEM_PROMPT = """Classify the user's Arabic message for the EAM homepage workspace.
Return ONLY valid JSON with this shape:
{"intent":"build_villa"|"general","confidence":0.0-1.0}

Rules:
- Use intent=build_villa only when the user clearly wants to build a villa/home/house project.
- Use intent=general for company questions, greetings, or unclear messages.
- Be conservative: if unsure, choose general with low confidence.
- Do not extract business fields or validate data."""

BUILD_VILLA_START_MESSAGE = (
    "رائع! سأساعدك في بدء رحلة جمع معلومات بناء الفيلا. "
    "لنبدأ خطوة بخطوة — أولاً أخبرني عن المدينة."
)

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
        if request.journey_snapshot and request.journey_snapshot.status == "active":
            return await self._journey_guidance(request.message, request.journey_snapshot)

        if classify_build_villa_deterministic(request.message, request.intent_hint):
            return WorkspaceTurnResponse(
                action="start_journey",
                journey_type=BUILD_VILLA_JOURNEY_TYPE,
                assistant_message=BUILD_VILLA_START_MESSAGE,
                ai_available=self.is_ai_available(),
                stream=False,
            )

        if resolve_intent_hint(request.intent_hint) == BUILD_VILLA_JOURNEY_TYPE:
            return WorkspaceTurnResponse(
                action="start_journey",
                journey_type=BUILD_VILLA_JOURNEY_TYPE,
                assistant_message=BUILD_VILLA_START_MESSAGE,
                ai_available=self.is_ai_available(),
                stream=False,
            )

        if not self.is_ai_available():
            return WorkspaceTurnResponse(
                action="ai_unavailable",
                assistant_message=(
                    "خدمة الذكاء الاصطناعي غير متاحة حالياً. "
                    "يمكنك بدء رحلة بناء الفيلا من الزر السريع «أبني منزلًا»."
                ),
                ai_available=False,
                stream=False,
            )

        intent = await self._classify_free_text_intent(request.message)
        if intent == BUILD_VILLA_JOURNEY_TYPE:
            return WorkspaceTurnResponse(
                action="start_journey",
                journey_type=BUILD_VILLA_JOURNEY_TYPE,
                assistant_message=BUILD_VILLA_START_MESSAGE,
                ai_available=True,
                stream=False,
            )

        if request.stream:
            return WorkspaceTurnResponse(
                action="general_answer",
                assistant_message="",
                ai_available=True,
                stream=True,
            )

        answer = await self._general_answer(request.message)
        return WorkspaceTurnResponse(
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

    async def _classify_free_text_intent(self, message: str) -> str:
        request = GenTxtRequest(
            messages=[
                ChatMessage(role="system", content=CLASSIFIER_SYSTEM_PROMPT),
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
            intent = payload.get("intent", "general")
            confidence = float(payload.get("confidence", 0.0))
            if intent == BUILD_VILLA_JOURNEY_TYPE and confidence >= 0.6:
                return BUILD_VILLA_JOURNEY_TYPE
        except Exception as exc:
            logger.warning("AI Core classifier failed; defaulting to general: %s", exc)
        return "general"

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
            return WorkspaceTurnResponse(
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

        return WorkspaceTurnResponse(
            action="journey_guidance",
            journey_type=snapshot.journey_type,
            assistant_message=message_text,
            ai_available=True,
            stream=False,
        )

    @staticmethod
    def _parse_classifier_json(content: str) -> dict:
        text = (content or "").strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
        return json.loads(text)
