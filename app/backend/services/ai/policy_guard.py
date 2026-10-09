"""Pre-model guardrails. They do not grant or replace tool permissions."""

from __future__ import annotations

import re

_BLOCKED = (
    re.compile(r"ignore\s+previous\s+instructions", re.IGNORECASE),
    re.compile(r"تجاهل\s+التعليمات\s+السابقة"),
    re.compile(r"reveal\s+other\s+customers?", re.IGNORECASE),
    re.compile(r"بيانات\s+عملاء\s+آخرين"),
)


def policy_block_reason(message: str) -> str | None:
    text = message or ""
    for pattern in _BLOCKED:
        if pattern.search(text):
            return "AI_POLICY_BLOCKED"
    return None
