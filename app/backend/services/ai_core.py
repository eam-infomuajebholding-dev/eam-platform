"""Thin AI Core intelligence layer for the homepage workspace."""

from __future__ import annotations

import json
import logging
import re
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from schemas.ai_contract import AI_CONTEXT_CONTRACT_VERSION, AIError
from schemas.ai_core import JourneySnapshot, WorkspaceClientHints, WorkspaceTurnRequest, WorkspaceTurnResponse
from schemas.ai_intent import IntentDecision
from services.ai.context_engine import AIContext, ActorBinding, ContextEngine, actor_binding
from schemas.aihub import ChatMessage, GenTxtRequest
from services.ai.intent_router import (
    BUILD_VILLA_START_MESSAGE,
    classifier_system_prompt,
    parse_model_intent_decision,
    route_intent_deterministic,
)
from services.ai.platform_assistant_policy import format_open_copilot_system_prompt
from services.ai.prompt_registry import EXECUTIVE_BRIEF, FAQ_SYSTEM
from services.ai.ai_trace import ai_trace
from services.ai.response_builder import build_workspace_response, new_trace_id
from services.ai_core_intents import BUILD_VILLA_JOURNEY_TYPE, BUILD_VILLA_QUICK_ACTION_LABEL, resolve_intent_hint
from services.ai.ai_gateway import AIGateway
from services.aihub import AIHubService
from services.ai.capability_registry import capability_for_intent
from services.ai.knowledge import format_knowledge_addendum, retrieve_knowledge
from services.ai.memory import record_token_usage
from services.ai.policy_guard import policy_block_reason

logger = logging.getLogger(__name__)

OPEN_COPILOT_SYSTEM_PROMPT = format_open_copilot_system_prompt()
FAQ_SYSTEM_PROMPT = FAQ_SYSTEM.content
JOURNEY_GUIDANCE_FALLBACK = "تابع الإجابة على السؤال الحالي لإكمال رحلة جمع المعلومات."
MAX_CONVERSATION_HISTORY = 20
OPEN_CHAT_MAX_TOKENS = 2048
_FORBIDDEN_MESSAGE = "لا يمكن فتح هذه الرحلة من الحساب الحالي."


class AIUnavailableError(RuntimeError):
    """Raised when AI Hub is not configured."""


def _should_auto_start_journey(request: WorkspaceTurnRequest, decision: IntentDecision | None) -> bool:
    """Only explicit platform actions start JOS — free text stays in open conversation."""
    if request.mode == "faq":
        return False
    if not decision or decision.action != "start_journey" or not decision.candidate_journey:
        return False
    if resolve_intent_hint(request.intent_hint):
        return True
    return (request.message or "").strip() == BUILD_VILLA_QUICK_ACTION_LABEL


def _candidate_journey_type(
    deterministic: IntentDecision | None,
    decision: IntentDecision | None,
) -> str | None:
    if deterministic and deterministic.candidate_journey:
        return deterministic.candidate_journey
    if decision and decision.candidate_journey:
        return decision.candidate_journey
    return None


def _chat_messages_for_request(request: WorkspaceTurnRequest) -> list[ChatMessage]:
    passages = retrieve_knowledge(request.message)
    messages = [
        ChatMessage(role="system", content=OPEN_COPILOT_SYSTEM_PROMPT),
        ChatMessage(role="system", content=format_knowledge_addendum(passages)),
    ]
    for item in request.conversation_history[-MAX_CONVERSATION_HISTORY:]:
        messages.append(ChatMessage(role=item.role, content=item.content))
    messages.append(ChatMessage(role="user", content=request.message))
    return messages


class AICoreService:
    """Intelligence layer: intent classification and conversational prose only."""

    def __init__(self) -> None:
        self.ai_hub = AIHubService()
        self.gateway = AIGateway(self.ai_hub)
        self._db = None

    def is_ai_available(self) -> bool:
        return self.ai_hub.client is not None

    async def resolve_context(
        self,
        request: WorkspaceTurnRequest,
        actor: ActorBinding | None,
        db: AsyncSession | None,
    ) -> AIContext:
        hints = request.client_hints or WorkspaceClientHints()
        journey_instance_id = hints.journey_instance_id
        if journey_instance_id is None and request.journey_snapshot is not None:
            journey_instance_id = request.journey_snapshot.journey_instance_id
            hints = hints.model_copy(update={"journey_instance_id": journey_instance_id})
        return await ContextEngine(db).build(actor or actor_binding(None, None), hints)

    async def handle_turn(
        self,
        request: WorkspaceTurnRequest,
        *,
        actor: ActorBinding | None = None,
        db: AsyncSession | None = None,
        resolved: AIContext | None = None,
    ) -> WorkspaceTurnResponse:
        context = resolved if resolved is not None else await self.resolve_context(request, actor, db)
        self._db = db
        trace_id = new_trace_id()
        with ai_trace(trace_id, "workspace.turn") as trace:
            _apply_context_trace(trace, context)
            if context.forbidden:
                trace.error_code = "AI_CONTEXT_FORBIDDEN"
                response = _forbidden_response(trace_id)
            else:
                response = await self._handle_turn_inner(request, trace, context)
            if response.journey_type:
                capability = capability_for_intent(response.journey_type)
                if capability:
                    response.capability_id = capability.capability_id
            if request.client_hints is not None:
                response.contract_version = AI_CONTEXT_CONTRACT_VERSION
            return response

    async def _handle_turn_inner(self, request: WorkspaceTurnRequest, trace, context: AIContext) -> WorkspaceTurnResponse:
        if policy_block_reason(request.message):
            trace.error_code = "AI_POLICY_BLOCKED"
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="general_answer",
                assistant_message="لا أستطيع تنفيذ هذا الطلب.",
                ai_available=self.is_ai_available(),
                stream=False,
                error=AIError(
                    code="AI_POLICY_BLOCKED",
                    message="Request blocked by policy",
                    user_message="لا أستطيع تنفيذ هذا الطلب.",
                    retryable=False,
                ),
            )

        citations = [passage.citation for passage in retrieve_knowledge(request.message)]
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
            answer = await self._general_answer(request)
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="general_answer",
                assistant_message=answer,
                ai_available=True,
                stream=False,
            )

        snapshot = _authoritative_snapshot(context) if request.journey_snapshot is not None else None
        if snapshot is not None and snapshot.status == "active":
            response = await self._journey_guidance(request.message, snapshot)
            response.trace_id = response.trace_id or trace.trace_id
            return response

        deterministic = route_intent_deterministic(request.message, request.intent_hint)
        if deterministic:
            trace.intent = deterministic.intent
            trace.confidence = deterministic.confidence
        if _should_auto_start_journey(request, deterministic):
            assert deterministic is not None and deterministic.candidate_journey
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
        if _should_auto_start_journey(request, decision):
            assert decision.candidate_journey
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="start_journey",
                journey_type=decision.candidate_journey,
                assistant_message=decision.assistant_message or BUILD_VILLA_START_MESSAGE,
                ai_available=True,
                stream=False,
                intent=decision,
            )

        journey_hint = _candidate_journey_type(deterministic, decision)

        if request.stream:
            return build_workspace_response(
                trace_id=trace.trace_id,
                action="general_answer",
                journey_type=journey_hint,
                assistant_message="",
                ai_available=True,
                stream=True,
                intent=decision,
                citations=citations,
            )

        answer = await self._general_answer(request)
        return build_workspace_response(
            trace_id=trace.trace_id,
            action="general_answer",
            journey_type=journey_hint,
            assistant_message=answer,
            ai_available=True,
            stream=request.stream,
            intent=decision,
            citations=citations,
        )

    async def stream_general_answer(
        self,
        request: WorkspaceTurnRequest,
        *,
        context: AIContext,
    ) -> AsyncGenerator[str, None]:
        trace_id = new_trace_id()
        with ai_trace(trace_id, "workspace.stream") as trace:
            _apply_context_trace(trace, context)
            if context.forbidden:
                trace.error_code = "AI_CONTEXT_FORBIDDEN"
                yield _FORBIDDEN_MESSAGE
                return
            if not self.is_ai_available():
                trace.error_code = "AI_NOT_CONFIGURED"
                yield (
                    "خدمة الذكاء الاصطناعي غير متاحة حالياً. "
                    "يمكنك متابعة استكشاف المنصة أو التواصل معنا على info@eam.sa."
                )
                return

            gen = GenTxtRequest(
                messages=_chat_messages_for_request(request),
                model="deepseek-v3.2",
                stream=True,
                temperature=0.55,
                max_tokens=OPEN_CHAT_MAX_TOKENS,
            )
            async for chunk in self.gateway.stream_text(gen):
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
            response = await self.gateway.complete_text(request)
            await record_token_usage(self._db, request.model, self.gateway.record_usage(response))
            payload = self._parse_classifier_json(response.content)
            return parse_model_intent_decision(payload)
        except Exception as exc:
            logger.warning("AI Core classifier failed; defaulting to general: %s", exc)
        return IntentDecision(intent="general", confidence=0.0, action="general_answer")

    async def _general_answer(self, request: WorkspaceTurnRequest) -> str:
        gen = GenTxtRequest(
            messages=_chat_messages_for_request(request),
            model="deepseek-v3.2",
            stream=False,
            temperature=0.55,
            max_tokens=OPEN_CHAT_MAX_TOKENS,
        )
        response = await self.gateway.complete_text(gen)
        await record_token_usage(self._db, gen.model, self.gateway.record_usage(response))
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
                ChatMessage(role="system", content=OPEN_COPILOT_SYSTEM_PROMPT),
                ChatMessage(role="user", content=prompt),
            ],
            model="deepseek-v3.2",
            stream=False,
            temperature=0.3,
            max_tokens=300,
        )
        try:
            response = await self.gateway.complete_text(request)
            await record_token_usage(self._db, request.model, self.gateway.record_usage(response))
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

    async def generate_executive_analysis(
        self,
        context: dict,
        question: str | None = None,
        *,
        ai_context: AIContext,
    ) -> dict:
        """Structured executive analysis from permission-filtered Command Center context."""
        if ai_context.forbidden:
            raise AIUnavailableError("AI context forbidden")
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
        response = await self.gateway.complete_text(request)
        await record_token_usage(self._db, request.model, self.gateway.record_usage(response))
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


def _apply_context_trace(trace, context: AIContext) -> None:
    trace.surface = context.surface
    trace.actor_kind = context.actor_kind
    trace.journey_id = context.journey_instance_id
    trace.conflict = context.conflict


def _forbidden_response(trace_id: str) -> WorkspaceTurnResponse:
    return build_workspace_response(
        trace_id=trace_id,
        action="general_answer",
        assistant_message=_FORBIDDEN_MESSAGE,
        ai_available=True,
        stream=False,
        error=AIError(
            code="AI_CONTEXT_FORBIDDEN",
            message="Journey is not owned by the actor",
            user_message=_FORBIDDEN_MESSAGE,
            retryable=False,
        ),
    )


def _authoritative_snapshot(context: AIContext) -> JourneySnapshot | None:
    if context.forbidden or context.journey_instance_id is None or not context.journey_type:
        return None
    return JourneySnapshot(
        journey_instance_id=context.journey_instance_id,
        journey_type=context.journey_type,
        current_step_key=context.journey_step_key or "",
        status=context.journey_status or "",
        context=context.journey_context,
    )
