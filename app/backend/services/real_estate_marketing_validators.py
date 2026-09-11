"""Domain validators for Real Estate Marketing journey (#02)."""

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

REAL_ESTATE_MARKETING_JOURNEY_TYPE = "real_estate_marketing"

MARKETING_GOALS = frozenset(
    {"sell_property", "rent_property", "launch_project", "brand_visibility", "other"}
)
TARGET_AUDIENCES = frozenset(
    {"end_buyers", "investors", "tenants", "brokers", "mixed", "other"}
)
MARKETING_STAGES = frozenset(
    {"planning", "pre_launch", "active_listing", "relaunch", "unknown"}
)
EXISTING_ASSETS = frozenset({"have_branding", "have_media", "partial", "none", "unknown"})
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})

MARKETING_GOAL_LABELS_AR = {
    "sell_property": "بيع عقار",
    "rent_property": "تسويق للإيجار",
    "launch_project": "إطلاق/تسويق مشروع",
    "brand_visibility": "ظهور/هوية/marketing",
    "other": "هدف آخر",
}


def validate_real_estate_marketing_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "marketing_goal":
        return {"marketing_goal": _require_enum(payload.get("marketing_goal"), "marketing_goal", MARKETING_GOALS)}

    if step_key == "property_description":
        return {
            "property_description": _require_string(
                payload.get("property_description"), "property_description", min_len=10, max_len=2000
            )
        }

    if step_key == "property_location":
        return {
            "property_location": _require_string(
                payload.get("property_location"), "property_location", min_len=2, max_len=120
            )
        }

    if step_key == "target_audience":
        return {
            "target_audience": _require_enum(payload.get("target_audience"), "target_audience", TARGET_AUDIENCES)
        }

    if step_key == "marketing_stage":
        return {
            "marketing_stage": _require_enum(payload.get("marketing_stage"), "marketing_stage", MARKETING_STAGES)
        }

    if step_key == "existing_assets":
        return {
            "existing_assets": _require_enum(payload.get("existing_assets"), "existing_assets", EXISTING_ASSETS)
        }

    if step_key == "channels_context":
        result: dict[str, Any] = {}
        notes = _optional_string(payload.get("channels_interest"), "channels_interest", max_len=2000)
        if notes is not None:
            result["channels_interest"] = notes
        return result

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

    if step_key == "budget_context":
        result: dict[str, Any] = {}
        budget = _optional_string(payload.get("budget_context"), "budget_context", max_len=500)
        if budget is not None:
            result["budget_context"] = budget
        return result

    if step_key in {"summary_review", "marketing_readiness_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError([_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")])
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError([_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")])
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Real Estate Marketing step: {step_key}")


def assemble_marketing_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    goal = context.get("marketing_goal")
    goal_label = MARKETING_GOAL_LABELS_AR.get(goal, "هدف تسويقي")
    missing: list[str] = []
    if context.get("existing_assets") in {None, "none", "unknown"}:
        missing.append("أصول تسويقية (صور/هوية/محتوى) — REQUIRES_VERIFICATION")
    if context.get("marketing_stage") == "unknown":
        missing.append("توضيح مرحلة التسويق الحالية")
    if not context.get("channels_interest"):
        missing.append("قنوات/اهتمامات تسويقية إن وُجدت")

    strategy_dimensions = [
        {
            "dimension": "الهدف التسويقي",
            "status": "USER_PROVIDED",
            "detail": goal_label,
        },
        {
            "dimension": "الجمهور المستهدف",
            "status": "USER_PROVIDED",
            "detail": context.get("target_audience"),
        },
        {
            "dimension": "الجاهزية",
            "status": "PRELIMINARY_GUIDANCE",
            "detail": "يلزم تحقق مهني قبل أي استنتاج طلب/تحويل/عائد حملة",
        },
    ]

    diligence_checklist = [
        "تأكيد ملكية/صلاحية تسويق العقار — REQUIRES_VERIFICATION",
        "مراجعة امتثال الإعلان العقاري — REQUIRES_VERIFICATION",
        "تحديد نطاق استراتيجية أولية مناسبة — GUIDANCE",
        "لا يُعد هذا brief طلباً/leads/ROI/تسعير إعلانات",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز أولي لجاهزية التسويق العقاري",
        "type": "PRELIMINARY_REAL_ESTATE_MARKETING_READINESS_BRIEF",
        "marketing_summary": context.get("property_description"),
        "property_context": {
            "property_description": context.get("property_description"),
            "property_location": context.get("property_location"),
            "marketing_goal": goal,
            "marketing_goal_label": goal_label,
            "marketing_stage": context.get("marketing_stage"),
        },
        "audience_and_assets": {
            "target_audience": context.get("target_audience"),
            "existing_assets": context.get("existing_assets"),
            "channels_interest": context.get("channels_interest"),
        },
        "timeline_context": {
            "target_timeline": context.get("target_timeline"),
            "urgency": context.get("urgency"),
            "budget_context": context.get("budget_context"),
        },
        "information_gaps": missing,
        "possible_strategy_dimensions": strategy_dimensions,
        "diligence_checklist": diligence_checklist,
        "regulatory_disclaimer": (
            "هذا موجز أولي لجاهزية التسويق وليس خطة حملة معتمدة ولا تقدير طلب/leads/ROI/تسعير إعلانات. "
            "لا تتضمن حجم سوق أو معدل تحويل أو أسعار وسائط."
        ),
        "recommended_next_step": "مراجعة مهنية لتأكيد نطاق التسويق والخطوة التالية الآمنة",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_real_estate_marketing_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_marketing_readiness_brief(context)
    return {
        "journey_type": REAL_ESTATE_MARKETING_JOURNEY_TYPE,
        "sector_slug": "real-estate-marketing",
        "marketing_goal": context.get("marketing_goal"),
        "property_description": context.get("property_description"),
        "property_location": context.get("property_location"),
        "target_audience": context.get("target_audience"),
        "marketing_stage": context.get("marketing_stage"),
        "existing_assets": context.get("existing_assets"),
        "channels_interest": context.get("channels_interest"),
        "target_timeline": context.get("target_timeline"),
        "urgency": context.get("urgency"),
        "budget_context": context.get("budget_context"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
