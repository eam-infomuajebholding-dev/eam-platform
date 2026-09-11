import json
import logging

from fastapi import APIRouter, HTTPException, Request, status
from schemas.ai_core import WorkspaceTurnRequest, WorkspaceTurnResponse
from services.ai_core import AICoreService
from services.ai_core_guard import AiCoreGuardError, check_rate_limit, validate_workspace_message
from services.ai_core_intents import classify_build_villa_deterministic, resolve_intent_hint
from sse_starlette.sse import EventSourceResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ai-core", tags=["ai-core"])


def _guard_workspace_request(http_request: Request, request: WorkspaceTurnRequest) -> WorkspaceTurnRequest:
    client_key = http_request.client.host if http_request.client else "unknown"
    check_rate_limit(client_key)
    request.message = validate_workspace_message(request.message)
    return request


@router.post("/workspace/turn", response_model=WorkspaceTurnResponse)
async def workspace_turn(http_request: Request, request: WorkspaceTurnRequest) -> WorkspaceTurnResponse:
    service = AICoreService()
    try:
        request = _guard_workspace_request(http_request, request)
        return await service.handle_turn(request)
    except AiCoreGuardError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("AI Core workspace turn failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.post("/workspace/stream")
async def workspace_stream(http_request: Request, request: WorkspaceTurnRequest):
    try:
        request = _guard_workspace_request(http_request, request)
    except AiCoreGuardError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc)) from exc

    service = AICoreService()

    if request.mode == "faq":
        async def faq_event():
            async for chunk in service.stream_general_answer(request.message):
                yield json.dumps({"content": chunk})
            yield "[DONE]"

        return EventSourceResponse(faq_event(), media_type="text/event-stream")

    if request.journey_snapshot or resolve_intent_hint(request.intent_hint):
        turn = await service.handle_turn(request)

        async def single_event():
            yield json.dumps({"content": turn.assistant_message})
            yield "[DONE]"

        return EventSourceResponse(single_event(), media_type="text/event-stream")

    if classify_build_villa_deterministic(request.message, request.intent_hint):
        turn = await service.handle_turn(request)

        async def journey_event():
            yield json.dumps({"content": turn.assistant_message})
            yield "[DONE]"

        return EventSourceResponse(journey_event(), media_type="text/event-stream")

    if not service.is_ai_available():
        async def unavailable_event():
            turn = await service.handle_turn(request)
            yield json.dumps({"content": turn.assistant_message})
            yield "[DONE]"

        return EventSourceResponse(unavailable_event(), media_type="text/event-stream")

    async def event_generator():
        try:
            async for chunk in service.stream_general_answer(request.message):
                yield json.dumps({"content": chunk})
        except Exception as exc:
            logger.error("AI Core stream failed: %s", exc)
            yield json.dumps({"content": f"[ERROR] {exc}"})
        finally:
            yield "[DONE]"

    return EventSourceResponse(event_generator(), media_type="text/event-stream")
