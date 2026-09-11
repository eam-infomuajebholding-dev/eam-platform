"""Domain validators for Furnishing journey (#15)."""

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

FURNISHING_JOURNEY_TYPE = "furnishing"

SPACE_TYPES = frozenset({"residential_home", "office", "villa", "retail", "hospitality", "other"})
PROJECT_STAGES = frozenset({"new_build", "renovation", "occupied", "ready_to_furnish", "other"})
FURNISHING_GOALS = frozenset(
    {"full_furnishing", "partial", "refresh", "office_setup", "hospitality_setup", "other"}
)
STYLE_DIRECTIONS = frozenset(
    {"modern", "classic", "minimalist", "luxury", "industrial", "eclectic", "undecided"}
)
BUDGET_RANGES = frozenset(
    {"not_defined", "economy", "mid_range", "premium", "luxury", "confidential"}
)
PROCUREMENT_PREFERENCES = frozenset({"self_sourced", "need_guidance", "turnkey_preferred", "undecided"})
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})


def validate_furnishing_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "space_type":
        return {"space_type": _require_enum(payload.get("space_type"), "space_type", SPACE_TYPES)}

    if step_key == "project_stage":
        return {
            "project_stage": _require_enum(payload.get("project_stage"), "project_stage", PROJECT_STAGES)
        }

    if step_key == "furnishing_goal":
        return {
            "furnishing_goal": _require_enum(
                payload.get("furnishing_goal"), "furnishing_goal", FURNISHING_GOALS
            )
        }

    if step_key == "style_direction":
        return {
            "style_direction": _require_enum(
                payload.get("style_direction"), "style_direction", STYLE_DIRECTIONS
            )
        }

    if step_key == "functional_priorities":
        return {
            "functional_priorities": _require_string(
                payload.get("functional_priorities"), "functional_priorities", min_len=5, max_len=2000
            )
        }

    if step_key == "room_scope":
        return {
            "room_scope": _require_string(payload.get("room_scope"), "room_scope", min_len=2, max_len=500)
        }

    if step_key == "budget_range":
        return {
            "budget_range": _require_enum(payload.get("budget_range"), "budget_range", BUDGET_RANGES)
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

    if step_key == "procurement_preference":
        return {
            "procurement_preference": _require_enum(
                payload.get("procurement_preference"), "procurement_preference", PROCUREMENT_PREFERENCES
            )
        }

    if step_key == "readiness_context":
        result: dict[str, Any] = {}
        notes = _optional_string(payload.get("current_readiness"), "current_readiness", max_len=2000)
        if notes is not None:
            result["current_readiness"] = notes
        return result

    if step_key in {"summary_review", "readiness_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError(
                [_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")]
            )
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError(
                [_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")]
            )
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Furnishing step: {step_key}")


def assemble_furnishing_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    missing: list[str] = []
    if context.get("style_direction") in {None, "undecided"}:
        missing.append("تحديد اتجاه التصميم أو الأسلوب المطلوب")
    if context.get("budget_range") in {None, "not_defined", "confidential"}:
        missing.append("توضيح فئة الميزانية أو القيود المالية")
    if not context.get("room_scope"):
        missing.append("تحديد نطاق الغرف أو المساحات المستهدفة")

    considerations = [
        "هذا موجز جاهزية أولي وليس تصميماً داخلياً معتمداً أو قائمة تسعير نهائية.",
        "لا يُعد وعداً بتوفر منتجات أو موردين أو مواعيد تسليم مضمونة.",
        "يلزم مراجعة مهنية لتأكيد الخطوة التشغيلية التالية.",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز جاهزية التأثيث والتجهيز",
        "understood_request": context.get("functional_priorities"),
        "space_context": {
            "space_type": context.get("space_type"),
            "project_stage": context.get("project_stage"),
            "furnishing_goal": context.get("furnishing_goal"),
            "room_scope": context.get("room_scope"),
        },
        "design_direction": {
            "style_direction": context.get("style_direction"),
            "functional_priorities": context.get("functional_priorities"),
        },
        "readiness": {
            "budget_range": context.get("budget_range"),
            "target_timeline": context.get("target_timeline"),
            "urgency": context.get("urgency"),
            "procurement_preference": context.get("procurement_preference"),
            "current_readiness": context.get("current_readiness"),
        },
        "missing_information": missing,
        "preliminary_considerations": considerations,
        "recommended_next_step": "مراجعة مهنية لتأكيد مفهوم التأثيث وخطوة التوريد أو التنسيق التالية",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_furnishing_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_furnishing_readiness_brief(context)
    return {
        "journey_type": FURNISHING_JOURNEY_TYPE,
        "sector_slug": "furnishing",
        "space_type": context.get("space_type"),
        "project_stage": context.get("project_stage"),
        "furnishing_goal": context.get("furnishing_goal"),
        "style_direction": context.get("style_direction"),
        "functional_priorities": context.get("functional_priorities"),
        "room_scope": context.get("room_scope"),
        "budget_range": context.get("budget_range"),
        "target_timeline": context.get("target_timeline"),
        "urgency": context.get("urgency"),
        "procurement_preference": context.get("procurement_preference"),
        "current_readiness": context.get("current_readiness"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
