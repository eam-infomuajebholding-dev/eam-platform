import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from core.database import db_manager, get_db
from dependencies.jos import get_anonymous_session_id, get_optional_current_user
from schemas.ai_core import WorkspaceTurnRequest, WorkspaceTurnResponse
from schemas.auth import UserResponse
from services.ai.context_engine import ActorBinding, actor_binding
from services.ai.memory import append_message, ensure_conversation, load_messages
from services.ai_core import AICoreService
from services.ai_core_guard import (
    AiCoreGuardError,
    check_distributed_rate_limit,
    check_rate_limit,
    validate_workspace_message,
)
from services.ai_core_intents import resolve_intent_hint

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ai-core", tags=["ai-core"])


def _guard_workspace_request(http_request: Request, request: WorkspaceTurnRequest) -> str:
    client_key = http_request.client.host if http_request.client else "unknown"
    request.message = validate_workspace_message(request.message)
    return client_key


async def _enforce_limit(db: AsyncSession, client_key: str) -> None:
    try:
        await check_distributed_rate_limit(db, client_key)
    except AiCoreGuardError:
        raise
    except Exception:
        check_rate_limit(client_key)


async def _remember_turn(
    db: AsyncSession,
    actor: ActorBinding,
    request: WorkspaceTurnRequest,
    response: WorkspaceTurnResponse,
) -> None:
    try:
        surface = request.client_hints.surface if request.client_hints else "home"
        conversation_id = await ensure_conversation(db, actor, request.conversation_id, surface)
        await append_message(db, conversation_id, "user", request.message)
        if response.assistant_message.strip():
            await append_message(db, conversation_id, "assistant", response.assistant_message)
        response.conversation_id = conversation_id
        await db.commit()
    except Exception:
        logger.exception("AI conversation persistence failed")
        await db.rollback()


@router.post("/workspace/turn", response_model=WorkspaceTurnResponse)
async def workspace_turn(
    http_request: Request,
    request: WorkspaceTurnRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
) -> WorkspaceTurnResponse:
    service = AICoreService()
    actor = actor_binding(current_user, anonymous_session_id)
    try:
        client_key = _guard_workspace_request(http_request, request)
        await _enforce_limit(db, client_key)
        response = await service.handle_turn(request, actor=actor, db=db)
        await _remember_turn(db, actor, request, response)
        return response
    except AiCoreGuardError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("AI Core workspace turn failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.get("/workspace/conversation/{conversation_id}")
async def workspace_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    actor = actor_binding(current_user, anonymous_session_id)
    messages = await load_messages(db, actor, conversation_id)
    if messages is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="conversation not found")
    return {"conversation_id": conversation_id, "messages": messages}


@router.post("/workspace/stream")
async def workspace_stream(
    http_request: Request,
    request: WorkspaceTurnRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse | None = Depends(get_optional_current_user),
    anonymous_session_id: str | None = Depends(get_anonymous_session_id),
):
    try:
        client_key = _guard_workspace_request(http_request, request)
        await _enforce_limit(db, client_key)
    except AiCoreGuardError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc)) from exc

    service = AICoreService()
    actor = actor_binding(current_user, anonymous_session_id)
    context = await service.resolve_context(request, actor, db)

    if (
        context.forbidden
        or request.journey_snapshot is not None
        or resolve_intent_hint(request.intent_hint)
        or not service.is_ai_available()
    ):
        turn = await service.handle_turn(request, actor=actor, db=db, resolved=context)
        await _remember_turn(db, actor, request, turn)

        async def single_event():
            yield json.dumps({"content": turn.assistant_message, "conversation_id": turn.conversation_id})
            yield "[DONE]"

        return EventSourceResponse(single_event(), media_type="text/event-stream")

    async def event_generator():
        parts: list[str] = []
        try:
            async for chunk in service.stream_general_answer(request, context=context):
                parts.append(chunk)
                yield json.dumps({"content": chunk, "conversation_id": request.conversation_id})
        except Exception as exc:
            logger.error("AI Core stream failed: %s", exc)
            yield json.dumps({"content": f"[ERROR] {exc}"})
        finally:
            text = "".join(parts).strip()
            if text and request.conversation_id and db_manager.async_session_maker is not None:
                try:
                    async with db_manager.async_session_maker() as session:
                        existing = await load_messages(session, actor, request.conversation_id)
                        last_role = existing[-1]["role"] if existing else None
                        if last_role != "assistant":
                            await append_message(session, request.conversation_id, "assistant", text)
                            await session.commit()
                except Exception:
                    logger.exception("AI stream persistence failed")
            yield "[DONE]"

    return EventSourceResponse(event_generator(), media_type="text/event-stream")
