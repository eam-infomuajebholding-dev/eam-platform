"""Domain validators for Government Services journey (#06)."""

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

GOVERNMENT_SERVICES_JOURNEY_TYPE = "government_services"

SERVICE_CATEGORIES = frozenset(
    {
        "deed_update",
        "survey_croquis",
        "building_permit",
        "subdivision_merge",
        "demolition_renovation",
        "violation_correction",
        "occupancy_certificate",
        "legacy_permit",
        "lift_ban",
        "collective_housing",
        "building_insurance",
        "other",
    }
)
PROPERTY_TYPES = frozenset({"residential", "commercial", "administrative", "land", "mixed", "other"})
DOCUMENTS_STATUS = frozenset({"have_partial", "none", "unknown"})
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})

CATEGORY_LABELS_AR = {
    "deed_update": "تحديث صكوك",
    "survey_croquis": "كروكيات إرشادية/تنظيمية",
    "building_permit": "رخص بناء",
    "subdivision_merge": "فرز/دمج عقاري",
    "demolition_renovation": "رخص هدم/ترميم",
    "violation_correction": "تصحيح مخالفات",
    "occupancy_certificate": "شهادات إشغال",
    "legacy_permit": "إضافة رخص قديمة",
    "lift_ban": "رفع حضر",
    "collective_housing": "رخص سكن جماعي",
    "building_insurance": "تأمين مباني",
    "other": "خدمة حكومية أخرى",
}


def validate_government_services_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "service_category":
        return {
            "service_category": _require_enum(
                payload.get("service_category"), "service_category", SERVICE_CATEGORIES
            )
        }

    if step_key == "property_location":
        return {"property_location": _require_string(payload.get("property_location"), "property_location", min_len=2, max_len=120)}

    if step_key == "property_type":
        return {"property_type": _require_enum(payload.get("property_type"), "property_type", PROPERTY_TYPES)}

    if step_key == "request_summary":
        return {
            "request_summary": _require_string(payload.get("request_summary"), "request_summary", min_len=10, max_len=2000)
        }

    if step_key == "documents_status":
        return {
            "documents_status": _require_enum(payload.get("documents_status"), "documents_status", DOCUMENTS_STATUS)
        }

    if step_key == "urgency_context":
        return {"urgency": _require_enum(payload.get("urgency"), "urgency", URGENCY_LEVELS)}

    if step_key in {"summary_review", "task_roadmap_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError([_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")])
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError([_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")])
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Government Services step: {step_key}")


def assemble_government_services_task_roadmap(context: dict[str, Any]) -> dict[str, Any]:
    category = context.get("service_category")
    category_label = CATEGORY_LABELS_AR.get(category, "خدمة حكومية")
    missing: list[str] = []
    if context.get("documents_status") == "none":
        missing.append("مستندات داعمة للطلب — GUIDANCE_TO_VERIFY")
    if context.get("documents_status") == "unknown":
        missing.append("توضيح حالة المستندات المتاحة")

    roadmap_steps = [
        {
            "step": "تأكيد نوع الخدمة",
            "status": "USER_PROVIDED_FACT",
            "detail": category_label,
        },
        {
            "step": "جمع المستندات المطلوبة",
            "status": "REQUIREMENT_TO_VERIFY",
            "detail": "تختلف حسب الجهة والخدمة — يلزم تحقق مهني",
        },
        {
            "step": "مراجعة مهنية أولية",
            "status": "GUIDANCE",
            "detail": "تحديد الجهة المختصة والمتطلبات الأولية",
        },
        {
            "step": "تقديم رسمي",
            "status": "GUIDANCE",
            "detail": "بعد اكتمال المستندات والتحقق",
        },
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "خارطة مهام أولية — الخدمات الحكومية",
        "understood_request": context.get("request_summary"),
        "service_context": {
            "service_category": category,
            "service_category_label": category_label,
            "property_location": context.get("property_location"),
            "property_type": context.get("property_type"),
            "documents_status": context.get("documents_status"),
            "urgency": context.get("urgency"),
        },
        "preliminary_roadmap": roadmap_steps,
        "missing_information": missing,
        "regulatory_disclaimer": (
            "هذه خارطة مهام أولية وليست استنتاجاً نظامياً أو ضماناً للأهلية. "
            "المتطلبات الحكومية تتغير ويلزم التحقق من المصدر الرسمي."
        ),
        "recommended_next_step": "مراجعة مهنية لتأكيد المتطلبات والجهة المختصة",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_government_services_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_government_services_task_roadmap(context)
    return {
        "journey_type": GOVERNMENT_SERVICES_JOURNEY_TYPE,
        "sector_slug": "government-services",
        "service_category": context.get("service_category"),
        "property_location": context.get("property_location"),
        "property_type": context.get("property_type"),
        "request_summary": context.get("request_summary"),
        "documents_status": context.get("documents_status"),
        "urgency": context.get("urgency"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
