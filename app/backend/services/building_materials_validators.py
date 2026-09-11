"""Domain validators for Building Materials journey (#10)."""

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

BUILDING_MATERIALS_JOURNEY_TYPE = "building_materials"

PROCUREMENT_GOALS = frozenset(
    {"project_supply", "maintenance_supply", "bulk_order", "specification_review", "other"}
)
MATERIAL_CATEGORIES = frozenset(
    {"structural", "finishing", "mep", "insulation", "mixed", "other"}
)
QUANTITY_SCOPES = frozenset({"small_batch", "medium", "large", "unknown"})
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})

PROCUREMENT_GOAL_LABELS_AR = {
    "project_supply": "توريد لمشروع",
    "maintenance_supply": "توريد صيانة/تشغيل",
    "bulk_order": "طلب كميات",
    "specification_review": "مراجعة مواصفات أولية",
    "other": "هدف آخر",
}


def validate_building_materials_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "procurement_goal":
        return {"procurement_goal": _require_enum(payload.get("procurement_goal"), "procurement_goal", PROCUREMENT_GOALS)}

    if step_key == "material_category":
        return {
            "material_category": _require_enum(
                payload.get("material_category"), "material_category", MATERIAL_CATEGORIES
            )
        }

    if step_key == "project_context":
        return {
            "project_context": _require_string(
                payload.get("project_context"), "project_context", min_len=10, max_len=2000
            )
        }

    if step_key == "delivery_location":
        return {
            "delivery_location": _require_string(
                payload.get("delivery_location"), "delivery_location", min_len=2, max_len=120
            )
        }

    if step_key == "quantity_scope":
        return {
            "quantity_scope": _require_enum(payload.get("quantity_scope"), "quantity_scope", QUANTITY_SCOPES)
        }

    if step_key == "specifications_context":
        result: dict[str, Any] = {}
        specs = _optional_string(payload.get("specifications_context"), "specifications_context", max_len=2000)
        if specs is not None:
            result["specifications_context"] = specs
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

    if step_key == "supplier_context":
        result: dict[str, Any] = {}
        supplier = _optional_string(payload.get("supplier_context"), "supplier_context", max_len=2000)
        if supplier is not None:
            result["supplier_context"] = supplier
        return result

    if step_key in {"summary_review", "procurement_readiness_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError([_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")])
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError([_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")])
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Building Materials step: {step_key}")


def assemble_procurement_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    goal = context.get("procurement_goal")
    goal_label = PROCUREMENT_GOAL_LABELS_AR.get(goal, "هدف توريد")
    missing: list[str] = []
    if not context.get("specifications_context"):
        missing.append("مواصفات/معايير تفصيلية — REQUIRES_VERIFICATION")
    if context.get("quantity_scope") in {None, "unknown"}:
        missing.append("تقدير الكميات أو النطاق")
    if not context.get("supplier_context"):
        missing.append("مورد/مصدر مفضل إن وُجد")

    diligence_checklist = [
        "تأكيد توفر المواصفات الفنية — REQUIRES_VERIFICATION",
        "مراجعة جاهزية التسليم والموقع — GUIDANCE",
        "لا يُعد هذا brief عرض سعر أو تسعير مواد أو التزام توريد",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز أولي لجاهزية توريد مواد البناء",
        "type": "PRELIMINARY_BUILDING_MATERIALS_PROCUREMENT_BRIEF",
        "procurement_summary": context.get("project_context"),
        "material_context": {
            "procurement_goal": goal,
            "procurement_goal_label": goal_label,
            "material_category": context.get("material_category"),
            "delivery_location": context.get("delivery_location"),
            "quantity_scope": context.get("quantity_scope"),
        },
        "specifications_context": context.get("specifications_context"),
        "timeline_context": {
            "target_timeline": context.get("target_timeline"),
            "urgency": context.get("urgency"),
            "budget_context": context.get("budget_context"),
        },
        "supplier_context": context.get("supplier_context"),
        "information_gaps": missing,
        "diligence_checklist": diligence_checklist,
        "regulatory_disclaimer": (
            "هذا موجز أولي لجاهزية التوريد وليس عرض سعر أو قائمة أسعار أو التزام توريد. "
            "لا تتضمن تسعير مواد أو جدول تسليم ملزم."
        ),
        "recommended_next_step": "مراجعة مهنية لتأكيد نطاق المواد والخطوة التالية الآمنة",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_building_materials_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_procurement_readiness_brief(context)
    return {
        "journey_type": BUILDING_MATERIALS_JOURNEY_TYPE,
        "sector_slug": "building-materials",
        "procurement_goal": context.get("procurement_goal"),
        "material_category": context.get("material_category"),
        "project_context": context.get("project_context"),
        "delivery_location": context.get("delivery_location"),
        "quantity_scope": context.get("quantity_scope"),
        "specifications_context": context.get("specifications_context"),
        "target_timeline": context.get("target_timeline"),
        "urgency": context.get("urgency"),
        "budget_context": context.get("budget_context"),
        "supplier_context": context.get("supplier_context"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
