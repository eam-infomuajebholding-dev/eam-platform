"""Domain validators for Equipment journey (#11)."""

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

EQUIPMENT_JOURNEY_TYPE = "equipment"

EQUIPMENT_NEEDS = frozenset(
    {"purchase", "rental", "maintenance_support", "specification_review", "other"}
)
EQUIPMENT_CATEGORIES = frozenset(
    {"heavy_machinery", "lifting", "power_tools", "vehicles", "mixed", "other"}
)
ENGAGEMENT_TYPES = frozenset({"buy", "rent", "lease", "service_only", "unknown"})
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})

EQUIPMENT_NEED_LABELS_AR = {
    "purchase": "شراء معدات",
    "rental": "استئجار معدات",
    "maintenance_support": "دعم/صيانة معدات",
    "specification_review": "مراجعة مواصفات أولية",
    "other": "حاجة أخرى",
}


def validate_equipment_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "equipment_need":
        return {"equipment_need": _require_enum(payload.get("equipment_need"), "equipment_need", EQUIPMENT_NEEDS)}

    if step_key == "equipment_category":
        return {
            "equipment_category": _require_enum(
                payload.get("equipment_category"), "equipment_category", EQUIPMENT_CATEGORIES
            )
        }

    if step_key == "usage_context":
        return {
            "usage_context": _require_string(payload.get("usage_context"), "usage_context", min_len=10, max_len=2000)
        }

    if step_key == "location":
        return {"location": _require_string(payload.get("location"), "location", min_len=2, max_len=120)}

    if step_key == "engagement_type":
        return {
            "engagement_type": _require_enum(payload.get("engagement_type"), "engagement_type", ENGAGEMENT_TYPES)
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

    if step_key == "readiness_context":
        result: dict[str, Any] = {}
        readiness = _optional_string(payload.get("readiness_context"), "readiness_context", max_len=2000)
        if readiness is not None:
            result["readiness_context"] = readiness
        return result

    if step_key in {"summary_review", "equipment_readiness_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError([_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")])
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError([_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")])
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Equipment step: {step_key}")


def assemble_equipment_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    need = context.get("equipment_need")
    need_label = EQUIPMENT_NEED_LABELS_AR.get(need, "حاجة معدات")
    missing: list[str] = []
    if not context.get("specifications_context"):
        missing.append("مواصفات/قدرة/موديل — REQUIRES_VERIFICATION")
    if context.get("engagement_type") in {None, "unknown"}:
        missing.append("توضيح نوع التعاقد (شراء/إيجار/خدمة)")
    if not context.get("readiness_context"):
        missing.append("جاهزية الموقع/التشغيل إن وُجدت")

    diligence_checklist = [
        "تأكيد مواصفات المعدات — REQUIRES_VERIFICATION",
        "مراجعة متطلبات السلامة والتشغيل — GUIDANCE",
        "لا يُعد هذا brief عرض سعر أو تسعير إيجار/شراء",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز أولي لجاهزية المعدات والآلات",
        "type": "PRELIMINARY_EQUIPMENT_READINESS_BRIEF",
        "equipment_summary": context.get("usage_context"),
        "equipment_context": {
            "equipment_need": need,
            "equipment_need_label": need_label,
            "equipment_category": context.get("equipment_category"),
            "location": context.get("location"),
            "engagement_type": context.get("engagement_type"),
        },
        "specifications_context": context.get("specifications_context"),
        "timeline_context": {
            "target_timeline": context.get("target_timeline"),
            "urgency": context.get("urgency"),
            "budget_context": context.get("budget_context"),
        },
        "readiness_context": context.get("readiness_context"),
        "information_gaps": missing,
        "diligence_checklist": diligence_checklist,
        "regulatory_disclaimer": (
            "هذا موجز أولي لجاهزية المعدات وليس عرض سعر أو جدول تسليم ملزم. "
            "لا تتضمن تسعير إيجار/شراء أو توفر مخزون."
        ),
        "recommended_next_step": "مراجعة مهنية لتأكيد نطاق المعدات والخطوة التالية الآمنة",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_equipment_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_equipment_readiness_brief(context)
    return {
        "journey_type": EQUIPMENT_JOURNEY_TYPE,
        "sector_slug": "equipment",
        "equipment_need": context.get("equipment_need"),
        "equipment_category": context.get("equipment_category"),
        "usage_context": context.get("usage_context"),
        "location": context.get("location"),
        "engagement_type": context.get("engagement_type"),
        "specifications_context": context.get("specifications_context"),
        "target_timeline": context.get("target_timeline"),
        "urgency": context.get("urgency"),
        "budget_context": context.get("budget_context"),
        "readiness_context": context.get("readiness_context"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
