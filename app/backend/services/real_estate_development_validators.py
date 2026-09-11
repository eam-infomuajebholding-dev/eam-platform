"""Domain validators for Real Estate Development journey (#01)."""

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

REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE = "real_estate_development"

ASSET_CONTEXTS = frozenset(
    {
        "owned_land",
        "owned_property",
        "evaluating_opportunity",
        "partnership_interest",
        "other",
    }
)
INTENDED_USES = frozenset(
    {"residential", "commercial", "mixed_use", "hospitality", "industrial", "other"}
)
CURRENT_STATUSES = frozenset(
    {
        "vacant_land",
        "existing_building",
        "partial_development",
        "planning_stage",
        "unknown",
    }
)
DOCUMENTS_READINESS = frozenset({"have_partial", "none", "unknown"})
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})

ASSET_CONTEXT_LABELS_AR = {
    "owned_land": "أرض مملوكة",
    "owned_property": "عقار/مبنى مملوك",
    "evaluating_opportunity": "تقييم فرصة",
    "partnership_interest": "اهتمام بشراكة/مشروع",
    "other": "سياق آخر",
}


def validate_real_estate_development_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "asset_context":
        return {
            "asset_context": _require_enum(payload.get("asset_context"), "asset_context", ASSET_CONTEXTS)
        }

    if step_key == "asset_location":
        return {
            "asset_location": _require_string(payload.get("asset_location"), "asset_location", min_len=2, max_len=120)
        }

    if step_key == "development_objective":
        return {
            "development_objective": _require_string(
                payload.get("development_objective"), "development_objective", min_len=10, max_len=2000
            )
        }

    if step_key == "intended_use":
        return {"intended_use": _require_enum(payload.get("intended_use"), "intended_use", INTENDED_USES)}

    if step_key == "current_status":
        return {
            "current_status": _require_enum(payload.get("current_status"), "current_status", CURRENT_STATUSES)
        }

    if step_key == "constraints_context":
        result: dict[str, Any] = {}
        notes = _optional_string(payload.get("known_constraints"), "known_constraints", max_len=2000)
        if notes is not None:
            result["known_constraints"] = notes
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

    if step_key in {"summary_review", "opportunity_snapshot_brief"}:
        return {}

    if step_key == "scope_confirm":
        if payload.get("scope_confirmed") is not True:
            raise FieldValidationError([_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")])
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        if payload.get("submit_confirmed") is not True:
            raise FieldValidationError([_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")])
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Real Estate Development step: {step_key}")


def assemble_development_opportunity_snapshot(context: dict[str, Any]) -> dict[str, Any]:
    asset_context = context.get("asset_context")
    asset_label = ASSET_CONTEXT_LABELS_AR.get(asset_context, "سياق تطوير")
    missing: list[str] = []
    if context.get("documents_readiness") in {None, "none", "unknown"}:
        missing.append("توضيح المستندات/الحقوق المتاحة — REQUIRES_VERIFICATION")
    if context.get("current_status") == "unknown":
        missing.append("توضيح الحالة الحالية للأصل/الموقع")
    if not context.get("known_constraints"):
        missing.append("قيود معروفة (تنظيمية/مالية/زمنية) إن وجدت")

    scenario_dimensions = [
        {
            "dimension": "الهدف التطويري",
            "status": "USER_PROVIDED",
            "detail": context.get("development_objective"),
        },
        {
            "dimension": "الاستخدام المستهدف",
            "status": "USER_PROVIDED",
            "detail": context.get("intended_use"),
        },
        {
            "dimension": "الجاهزية",
            "status": "PRELIMINARY_GUIDANCE",
            "detail": "يلزم تحقق مهني قبل أي استنتاج جدوى أو تنظيمي",
        },
    ]

    diligence_checklist = [
        "تأكيد ملكية/صلاحية التصرف في الأصل — REQUIRES_VERIFICATION",
        "مراجعة القيود التنظيمية المحلية — REQUIRES_VERIFICATION",
        "تحديد نطاق دراسة أولية مناسبة — GUIDANCE",
        "لا يُعد هذا لقطة جدوى أو تقييم سوقي",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "لقطة فرصة تطوير أولية",
        "type": "PRELIMINARY_DEVELOPMENT_OPPORTUNITY_SNAPSHOT",
        "opportunity_summary": context.get("development_objective"),
        "asset_context": {
            "asset_context": asset_context,
            "asset_context_label": asset_label,
            "asset_location": context.get("asset_location"),
            "current_status": context.get("current_status"),
            "intended_use": context.get("intended_use"),
        },
        "readiness_state": {
            "documents_readiness": context.get("documents_readiness"),
            "target_timeline": context.get("target_timeline"),
            "urgency": context.get("urgency"),
        },
        "known_constraints": context.get("known_constraints"),
        "information_gaps": missing,
        "possible_scenario_dimensions": scenario_dimensions,
        "diligence_checklist": diligence_checklist,
        "regulatory_disclaimer": (
            "هذه لقطة فرصة أولية وليست دراسة جدوى أو تقييم عقاري أو استنتاجاً تنظيمياً. "
            "لا تتضمن قيمة أرض/عائد/موافقات مضمونة."
        ),
        "recommended_next_step": "مراجعة مهنية لتأكيد نطاق التحقق والخطوة التالية الآمنة",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_real_estate_development_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_development_opportunity_snapshot(context)
    return {
        "journey_type": REAL_ESTATE_DEVELOPMENT_JOURNEY_TYPE,
        "sector_slug": "real-estate-development",
        "asset_context": context.get("asset_context"),
        "asset_location": context.get("asset_location"),
        "development_objective": context.get("development_objective"),
        "intended_use": context.get("intended_use"),
        "current_status": context.get("current_status"),
        "known_constraints": context.get("known_constraints"),
        "documents_readiness": context.get("documents_readiness"),
        "target_timeline": context.get("target_timeline"),
        "urgency": context.get("urgency"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
