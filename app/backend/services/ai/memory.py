"""Permission-scoped conversation memory. A foreign id never returns another actor's text."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.ai_platform import AIConversation, AIConversationMessage, AIHandoff, AITokenUsage
from services.ai.context_engine import ActorBinding


def actor_storage_key(actor: ActorBinding | None) -> str | None:
    if actor is None:
        return None
    if actor.user_id:
        return f"user:{actor.user_id}"
    if actor.anonymous_session_id:
        return f"anon:{actor.anonymous_session_id}"
    return None


async def ensure_conversation(
    db: AsyncSession,
    actor: ActorBinding | None,
    conversation_id: str | None,
    surface: str,
) -> str | None:
    key = actor_storage_key(actor)
    if key is None or db is None:
        return None
    if conversation_id:
        existing = await db.get(AIConversation, conversation_id)
        if existing is not None and existing.actor_key == key:
            return existing.id
    created = AIConversation(
        id=str(uuid.uuid4()),
        actor_key=key,
        surface=surface or "home",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(created)
    await db.flush()
    return created.id


async def append_message(db: AsyncSession, conversation_id: str | None, role: str, content: str) -> None:
    text = (content or "").strip()
    if db is None or not conversation_id or not text:
        return
    db.add(
        AIConversationMessage(
            conversation_id=conversation_id,
            role=role,
            content=text[:4000],
            created_at=datetime.now(timezone.utc),
        )
    )
    conversation = await db.get(AIConversation, conversation_id)
    if conversation is not None:
        conversation.updated_at = datetime.now(timezone.utc)
    await db.flush()


async def load_messages(db: AsyncSession, actor: ActorBinding | None, conversation_id: str) -> list[dict[str, str]] | None:
    key = actor_storage_key(actor)
    if key is None:
        return None
    conversation = await db.get(AIConversation, conversation_id)
    if conversation is None or conversation.actor_key != key:
        return None
    result = await db.execute(
        select(AIConversationMessage)
        .where(AIConversationMessage.conversation_id == conversation_id)
        .order_by(AIConversationMessage.id.asc())
    )
    rows = result.scalars().all()
    return [{"role": row.role, "content": row.content} for row in rows[-20:]]


async def persist_handoff(
    db: AsyncSession,
    *,
    trace_id: str,
    actor_key: str | None,
    reason: str,
    summary: str | None,
    journey_instance_id: int | None,
    service_request_id: int | None,
) -> int:
    row = AIHandoff(
        trace_id=trace_id,
        actor_key=actor_key,
        reason=reason,
        summary=summary,
        journey_instance_id=journey_instance_id,
        service_request_id=int(service_request_id) if service_request_id is not None else None,
        status="queued",
        created_at=datetime.now(timezone.utc),
    )
    db.add(row)
    await db.flush()
    return int(row.id)


async def record_token_usage(db: AsyncSession | None, model: str, usage: dict[str, int] | None) -> None:
    if db is None or not usage:
        return
    try:
        db.add(
            AITokenUsage(
                model=model,
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                total_tokens=usage.get("total_tokens", 0),
                created_at=datetime.now(timezone.utc),
            )
        )
        await db.flush()
    except Exception:
        return
