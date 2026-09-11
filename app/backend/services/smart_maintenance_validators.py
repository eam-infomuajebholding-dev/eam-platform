"""Domain validators for Smart Maintenance journey (#13)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from services.build_villa_validators import (
    FieldValidationError,
    _error,
    _optional_bool,
    _optional_string,
    _require_enum,
    _require_string,
)
from services.jos_validators import JourneyValidationError

SMART_MAINTENANCE_JOURNEY_TYPE = "smart_maintenance"

MAINTENANCE_CATEGORIES = frozenset(
    {"hvac", "electrical", "plumbing", "building", "elevator", "fire_safety", "general", "other"}
)
SEVERITY_LEVELS = frozenset({"critical", "high", "moderate", "low"})
ACCESS_READINESS = frozenset(
    {"accessible", "restricted", "tenant_occupied", "after_hours_only", "unknown"}
)
ENGAGEMENT_GOALS = frozenset(
    {
        "emergency_response",
        "corrective_repair",
        "preventive_plan",
        "readiness_review",
        "contract_review",
        "other",
    }
)
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})


def validate_smart_maintenance_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "maintenance_category":
        return {
            "maintenance_category": _require_enum(
                payload.get("maintenance_category"), "maintenance_category", MAINTENANCE_CATEGORIES
            )
        }

    if step_key == "asset_location":
        return {"location": _require_string(payload.get("location"), "location", min_len=2, max_len=120)}

    if step_key == "issue_description":
        return {
            "issue_description": _require_string(
                payload.get("issue_description"), "issue_description", min_len=10, max_len=2000
            )
        }

    if step_key == "severity_level":
        return {
            "severity_level": _require_enum(payload.get("severity_level"), "severity_level", SEVERITY_LEVELS)
        }

    if step_key == "access_readiness":
        return {
            "access_readiness": _require_enum(
                payload.get("access_readiness"), "access_readiness", ACCESS_READINESS
            )
        }

    if step_key == "system_context":
        result: dict[str, Any] = {}
        notes = _optional_string(payload.get("system_notes"), "system_notes", max_len=2000)
        if notes is not None:
            result["system_notes"] = notes
        return result

    if step_key == "prior_service_context":
        result = {}
        prior = _optional_bool(payload.get("prior_maintenance"), "prior_maintenance")
        if prior is not None:
            result["prior_maintenance"] = prior
        notes = _optional_string(payload.get("service_notes"), "service_notes", max_len=2000)
        if notes is not None:
            result["service_notes"] = notes
        return result

    if step_key == "engagement_goal":
        return {
            "engagement_goal": _require_enum(
                payload.get("engagement_goal"), "engagement_goal", ENGAGEMENT_GOALS
            )
        }

    if step_key == "timeline_context":
        result = {
            "desired_timeline": _require_string(
                payload.get("desired_timeline"), "desired_timeline", min_len=2, max_len=120
            )
        }
        urgency = payload.get("urgency")
        if urgency is not None and urgency != "":
            result["urgency"] = _require_enum(urgency, "urgency", URGENCY_LEVELS)
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

    raise JourneyValidationError(f"Unknown Smart Maintenance step: {step_key}")


def assemble_maintenance_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    missing: list[str] = []
    if context.get("access_readiness") in {None, "restricted", "unknown", "tenant_occupied"}:
        missing.append("جاهزية الوصول للموقع/المعدّ")
    if context.get("severity_level") == "critical" and context.get("engagement_goal") != "emergency_response":
        missing.append("توضيح ما إذا كانت الحالة طارئة فعلاً")
    if not context.get("prior_maintenance") and context.get("maintenance_category") == "hvac":
        missing.append("سجل صيانة سابق لأنظمة HVAC إن وُجد")

    considerations = [
        "هذا موجز جاهزية أولي وليس تقرير صيانة معتمد أو ضمان إصلاح نهائي.",
        "لا يُعد وعداً بزمن استجابة ميداني أو توفر فني أو قطع غيار.",
        "يلزم مراجعة مهنية وتقييم ميداني قبل أي التزام تشغيلي.",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز جاهزية الصيانة الذكية",
        "understood_request": context.get("issue_description"),
        "maintenance_context": {
            "maintenance_category": context.get("maintenance_category"),
            "location": context.get("location"),
            "severity_level": context.get("severity_level"),
            "access_readiness": context.get("access_readiness"),
        },
        "readiness": {
            "engagement_goal": context.get("engagement_goal"),
            "desired_timeline": context.get("desired_timeline"),
            "urgency": context.get("urgency"),
        },
        "service_context": {
            "prior_maintenance": context.get("prior_maintenance"),
            "system_notes": context.get("system_notes"),
            "service_notes": context.get("service_notes"),
        },
        "missing_information": missing,
        "preliminary_considerations": considerations,
        "recommended_next_step": "مراجعة مهنية لتحديد أولوية الاستجابة والخطوة التشغيلية التالية",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_smart_maintenance_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_maintenance_readiness_brief(context)
    return {
        "journey_type": SMART_MAINTENANCE_JOURNEY_TYPE,
        "sector_slug": "smart-maintenance",
        "maintenance_category": context.get("maintenance_category"),
        "location": context.get("location"),
        "issue_description": context.get("issue_description"),
        "severity_level": context.get("severity_level"),
        "access_readiness": context.get("access_readiness"),
        "system_notes": context.get("system_notes"),
        "prior_maintenance": context.get("prior_maintenance"),
        "service_notes": context.get("service_notes"),
        "engagement_goal": context.get("engagement_goal"),
        "desired_timeline": context.get("desired_timeline"),
        "urgency": context.get("urgency"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
