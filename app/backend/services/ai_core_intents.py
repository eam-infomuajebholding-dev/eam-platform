"""Minimal M1 intent registry for AI Core."""

from __future__ import annotations

import re
import unicodedata

BUILD_VILLA_JOURNEY_TYPE = "build_villa"
BUILD_VILLA_QUICK_ACTION_LABEL = "أبني منزلًا"

M1_JOURNEY_INTENTS = frozenset({BUILD_VILLA_JOURNEY_TYPE})

BUILD_VILLA_PHRASE_PATTERNS = (
    re.compile(r"أريد\s+بناء", re.IGNORECASE),
    re.compile(r"أبغ[ىا]\s+أ?بني", re.IGNORECASE),
    re.compile(r"^\s*أ?بني\s+", re.IGNORECASE),
    re.compile(r"بناء\s+(?:فيلا|فilla|فيلة|منزل|بيت|فيلا)", re.IGNORECASE),
    re.compile(r"build\s+villa", re.IGNORECASE),
)

BUILD_VILLA_KEYWORD_GROUPS = (
    frozenset({"بناء", "ابني", "أبني", "ابغى", "أبغى", "build"}),
    frozenset({"فيلا", "فilla", "فيلة", "منزل", "بيت", "villa", "home"}),
)


def normalize_message(message: str) -> str:
    normalized = unicodedata.normalize("NFKC", message or "")
    normalized = normalized.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    normalized = normalized.replace("ى", "ي").replace("ة", "ه")
    return " ".join(normalized.lower().split())


def resolve_intent_hint(intent_hint: str | None) -> str | None:
    if not intent_hint:
        return None
    normalized = intent_hint.strip().lower()
    if normalized in M1_JOURNEY_INTENTS:
        return normalized
    if normalized in {"build-villa", "build villa"}:
        return BUILD_VILLA_JOURNEY_TYPE
    if intent_hint.strip() == BUILD_VILLA_QUICK_ACTION_LABEL:
        return BUILD_VILLA_JOURNEY_TYPE
    return None


def classify_build_villa_deterministic(message: str, intent_hint: str | None = None) -> bool:
    hinted = resolve_intent_hint(intent_hint)
    if hinted == BUILD_VILLA_JOURNEY_TYPE:
        return True

    trimmed = (message or "").strip()
    if trimmed == BUILD_VILLA_QUICK_ACTION_LABEL:
        return True

    normalized = normalize_message(trimmed)
    if not normalized:
        return False

    for pattern in BUILD_VILLA_PHRASE_PATTERNS:
        if pattern.search(trimmed) or pattern.search(normalized):
            return True

    tokens = set(normalized.split())
    for group in BUILD_VILLA_KEYWORD_GROUPS:
        if tokens.intersection(group):
            if len(tokens.intersection(BUILD_VILLA_KEYWORD_GROUPS[0])) > 0 and len(
                tokens.intersection(BUILD_VILLA_KEYWORD_GROUPS[1])
            ) > 0:
                return True

    return False
