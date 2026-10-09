"""Lightweight AI Core request guards.

The in-process window remains a fallback. The database window is shared across processes.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.ai_platform import AIUsageEvent

MAX_MESSAGE_LENGTH = 4000
MAX_REQUESTS_PER_WINDOW = 30
WINDOW_SECONDS = 60

_recent: dict[str, deque[float]] = defaultdict(deque)


class AiCoreGuardError(ValueError):
    """Raised when a workspace request exceeds guard limits."""


def validate_workspace_message(message: str) -> str:
    trimmed = (message or "").strip()
    if not trimmed:
        raise AiCoreGuardError("message is required")
    if len(trimmed) > MAX_MESSAGE_LENGTH:
        raise AiCoreGuardError(f"message exceeds maximum length of {MAX_MESSAGE_LENGTH}")
    return trimmed


def check_rate_limit(client_key: str) -> None:
    """Simple in-process sliding window limiter keyed by client identity."""
    now = time.monotonic()
    bucket = _recent[client_key]
    while bucket and now - bucket[0] > WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= MAX_REQUESTS_PER_WINDOW:
        raise AiCoreGuardError("rate limit exceeded; please retry shortly")
    bucket.append(now)


async def check_distributed_rate_limit(db: AsyncSession, client_key: str) -> None:
    """Sliding window stored in the database so more than one process shares it."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=WINDOW_SECONDS)
    await db.execute(delete(AIUsageEvent).where(AIUsageEvent.created_at < cutoff))
    count = await db.scalar(
        select(func.count()).select_from(AIUsageEvent).where(
            AIUsageEvent.client_key == client_key,
            AIUsageEvent.created_at >= cutoff,
        )
    )
    if int(count or 0) >= MAX_REQUESTS_PER_WINDOW:
        raise AiCoreGuardError("rate limit exceeded; please retry shortly")
    db.add(AIUsageEvent(client_key=client_key, created_at=now))
    await db.flush()
