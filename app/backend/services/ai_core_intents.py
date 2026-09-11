"""Minimal M1 intent registry for AI Core."""

from __future__ import annotations

import re
import unicodedata

BUILD_VILLA_JOURNEY_TYPE = "build_villa"
ENGINEERING_CONSULTING_JOURNEY_TYPE = "engineering_consulting"
CONTRACTING_JOURNEY_TYPE = "contracting"
REAL_ESTATE_VALUATION_JOURNEY_TYPE = "real_estate_valuation"
SMART_MAINTENANCE_JOURNEY_TYPE = "smart_maintenance"
PROJECT_MANAGEMENT_JOURNEY_TYPE = "project_management"
FURNISHING_JOURNEY_TYPE = "furnishing"
FACILITY_MANAGEMENT_JOURNEY_TYPE = "facility_management"
GOVERNMENT_SERVICES_JOURNEY_TYPE = "government_services"
REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE = "real_estate_development"
REAL_ESTATE_MARKETING_JOURNEY_TYPE = "real_estate_marketing"
BUILD_VILLA_QUICK_ACTION_LABEL = "أبني منزلًا"
ENGINEERING_CONSULTING_LABEL = "استشارة هندسية"

M1_JOURNEY_INTENTS = frozenset(
    {
        BUILD_VILLA_JOURNEY_TYPE,
        ENGINEERING_CONSULTING_JOURNEY_TYPE,
        CONTRACTING_JOURNEY_TYPE,
        REAL_ESTATE_VALUATION_JOURNEY_TYPE,
        SMART_MAINTENANCE_JOURNEY_TYPE,
        PROJECT_MANAGEMENT_JOURNEY_TYPE,
        FURNISHING_JOURNEY_TYPE,
        FACILITY_MANAGEMENT_JOURNEY_TYPE,
        GOVERNMENT_SERVICES_JOURNEY_TYPE,
        REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
        REAL_ESTATE_MARKETING_JOURNEY_TYPE,
    }
)

BUILD_VILLA_PHRASE_PATTERNS = (
    re.compile(r"أريد\s+بناء", re.IGNORECASE),
    re.compile(r"أبغ[ىا]\s+أ?بني", re.IGNORECASE),
    re.compile(r"احتاج\s+أ?بني", re.IGNORECASE),
    re.compile(r"اب?[ي]\s+اسوي\s+(?:بيت|منزل|فيلا)", re.IGNORECASE),
    re.compile(r"عندي\s+أ?رض.{0,30}أ?ب?[ي]\s+أ?بني", re.IGNORECASE),
    re.compile(r"^\s*أ?بني\s+", re.IGNORECASE),
    re.compile(r"بناء\s+(?:فيلا|فيلة|منزل|بيت)", re.IGNORECASE),
    re.compile(r"تصميم\s+(?:فيلا|منزل|بيت)", re.IGNORECASE),
    re.compile(r"build\s+villa", re.IGNORECASE),
    re.compile(r"new\s+house", re.IGNORECASE),
    re.compile(r"new\s+villa\s+project", re.IGNORECASE),
    re.compile(r"house\s+design", re.IGNORECASE),
    re.compile(r"مشروع\s+فيلا", re.IGNORECASE),
    re.compile(r"تصميم\s+بيت", re.IGNORECASE),
)

BUILD_VILLA_KEYWORD_GROUPS = (
    frozenset({"بناء", "ابني", "أبني", "ابغى", "أبغى", "ابغي", "build"}),
    frozenset({"فيلا", "فيلة", "منزل", "بيت", "villa", "home"}),
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
    if normalized in {"engineering-consulting", "engineering_consulting", "engineering consulting"}:
        return ENGINEERING_CONSULTING_JOURNEY_TYPE
    if normalized in {"contracting", "contractor", "construction-contractor"}:
        return CONTRACTING_JOURNEY_TYPE
    if normalized in {
        "real-estate-valuation",
        "real_estate_valuation",
        "valuation",
        "property-valuation",
    }:
        return REAL_ESTATE_VALUATION_JOURNEY_TYPE
    if normalized in {
        "smart-maintenance",
        "smart_maintenance",
        "maintenance",
        "hvac-maintenance",
    }:
        return SMART_MAINTENANCE_JOURNEY_TYPE
    if normalized in {
        "project-management",
        "project_management",
        "pm",
    }:
        return PROJECT_MANAGEMENT_JOURNEY_TYPE
    if normalized in {
        "furnishing",
        "furnish",
        "interior-furnishing",
    }:
        return FURNISHING_JOURNEY_TYPE
    if normalized in {
        "facility-management",
        "facility_management",
        "facilities",
        "fm",
    }:
        return FACILITY_MANAGEMENT_JOURNEY_TYPE
    if normalized in {
        "government-services",
        "government_services",
        "government",
        "gs",
        "permits",
        "building-permit",
    }:
        return GOVERNMENT_SERVICES_JOURNEY_TYPE
    if normalized in {
        "real-estate-marketing",
        "real_estate_marketing",
        "marketing",
        "property-marketing",
    }:
        return REAL_ESTATE_MARKETING_JOURNEY_TYPE
    if normalized in {
        "real-estate-development",
        "real_estate_development",
        "development",
        "property-development",
    }:
        return REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE
    if intent_hint.strip() == BUILD_VILLA_QUICK_ACTION_LABEL:
        return BUILD_VILLA_JOURNEY_TYPE
    if intent_hint.strip() == ENGINEERING_CONSULTING_LABEL:
        return ENGINEERING_CONSULTING_JOURNEY_TYPE
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

    build_verbs = BUILD_VILLA_KEYWORD_GROUPS[0]
    dwelling_terms = BUILD_VILLA_KEYWORD_GROUPS[1] | frozenset({"ارض"})
    if tokens.intersection({"ارض", "land"}) and tokens.intersection(build_verbs):
        return True
    if tokens.intersection(build_verbs) and tokens.intersection(dwelling_terms):
        return True

    return False
