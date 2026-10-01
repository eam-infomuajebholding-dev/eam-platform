"""Domain validators for Investment journey (#03) — preliminary interest only, no ROI promises."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from services.build_villa_validators import (
    FieldValidationError,
    _error,
    _optional_string,
    _require_enum,
    _require_string,
)
from services.jos_validators import JourneyValidationError

INVESTMENT_JOURNEY_TYPE = "investment"

INVESTOR_PROFILES = frozenset({"individual", "company", "family_office", "fund", "other"})
INTEREST_FOCI = frozenset(
    {"real_estate_development", "income_assets", "joint_venture", "portfolio_review", "other"}
)
CAPITAL_HORIZONS = frozenset({"short", "medium", "long", "undecided"})
RISK_COMFORT = frozenset({"conservative", "balanced", "growth", "not_sure"})
DOCUMENTS_READINESS = frozenset({"have_partial", "none", "unknown"})
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})


def validate_investment_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "investor_profile":
        return {
            "investor_profile": _require_enum(payload.get("investor_profile"), "investor_profile", INVESTOR_PROFILES)
        }

    if step_key == "interest_focus":
        return {
            "interest_focus": _require_enum(payload.get("interest_focus"), "interest_focus", INTEREST_FOCI)
        }

    if step_key == "capital_horizon":
        return {
            "capital_horizon": _require_enum(payload.get("capital_horizon"), "capital_horizon", CAPITAL_HORIZONS)
        }

    if step_key == "geography_focus":
        return {
            "geography_focus": _require_string(
                payload.get("geography_focus"), "geography_focus", min_len=2, max_len=200
            )
        }

    if step_key == "risk_comfort":
        return {"risk_comfort": _require_enum(payload.get("risk_comfort"), "risk_comfort", RISK_COMFORT)}

    if step_key == "compliance_context":
        result: dict[str, Any] = {}
        notes = _optional_string(payload.get("regulatory_notes"), "regulatory_notes", max_len=2000)
        if notes is not None:
            result["regulatory_notes"] = notes
        return result

    if step_key == "documents_readiness":
        return {
            "documents_readiness": _require_enum(
                payload.get("documents_readiness"), "documents_readiness", DOCUMENTS_READINESS
            )
        }

    if step_key == "timeline_context":
        result = {
            "target_timeline": _require_string(
                payload.get("target_timeline"), "target_timeline", min_len=2, max_len=120
            )
        }
        urgency = payload.get("urgency")
        if urgency is not None and urgency != "":
            result["urgency"] = _require_enum(urgency, "urgency", URGENCY_LEVELS)
        return result

    if step_key in {"summary_review", "investment_interest_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError([_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")])
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError([_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")])
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Investment step: {step_key}")


def assemble_investment_interest_brief(context: dict[str, Any]) -> dict[str, Any]:
    missing: list[str] = []
    if context.get("documents_readiness") in {None, "none", "unknown"}:
        missing.append("توضيح المستندات/الصلاحيات المتاحة — REQUIRES_VERIFICATION")
    if not context.get("regulatory_notes"):
        missing.append("أي قيود تنظيمية أو امتثال معروفة")

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز اهتمام استثماري أولي",
        "understood_request": context.get("interest_focus"),
        "investor_context": {
            "investor_profile": context.get("investor_profile"),
            "capital_horizon": context.get("capital_horizon"),
            "geography_focus": context.get("geography_focus"),
            "risk_comfort": context.get("risk_comfort"),
        },
        "missing_information": missing,
        "preliminary_considerations": [
            "لا يُعد هذا موجزاً وعداً بعائد أو فرصة معتمدة أو توصية استثمارية.",
            "أي متابعة تخضع للتحقق التنظيمي والمهني ولا تضمن قبولاً أو تنفيذاً.",
            "يلزم مراجعة EAM قبل أي خطوة تشغيلية أو عرض ملزم.",
        ],
        "recommended_next_step": "مراجعة مهنية لتأكيد ملاءمة المسار والخطوة التالية",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_investment_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_investment_interest_brief(context)
    return {
        "journey_type": INVESTMENT_JOURNEY_TYPE,
        "sector_slug": "investment",
        "investor_profile": context.get("investor_profile"),
        "interest_focus": context.get("interest_focus"),
        "capital_horizon": context.get("capital_horizon"),
        "geography_focus": context.get("geography_focus"),
        "risk_comfort": context.get("risk_comfort"),
        "regulatory_notes": context.get("regulatory_notes"),
        "documents_readiness": context.get("documents_readiness"),
        "target_timeline": context.get("target_timeline"),
        "urgency": context.get("urgency"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
