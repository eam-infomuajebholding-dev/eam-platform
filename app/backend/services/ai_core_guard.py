"""Lightweight AI Core request guards (in-process; not distributed rate limiting)."""

from __future__ import annotations

import time
from collections import defaultdict, deque

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
