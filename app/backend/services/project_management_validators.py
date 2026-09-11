"""Domain validators for Project Management journey (#07)."""

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

PROJECT_MANAGEMENT_JOURNEY_TYPE = "project_management"

PROJECT_TYPES = frozenset(
    {"residential", "commercial", "mixed_use", "infrastructure", "renovation", "other"}
)
PROJECT_STAGES = frozenset(
    {"concept", "planning", "design", "procurement", "execution", "delayed", "closeout", "other"}
)
SCOPE_CLARITY_LEVELS = frozenset({"clear", "partial", "unclear", "evolving"})
BUDGET_STATES = frozenset(
    {"not_defined", "rough_estimate", "approved_budget", "constrained", "confidential"}
)
ENGAGEMENT_GOALS = frozenset(
    {
        "pm_setup",
        "recovery_plan",
        "governance_review",
        "schedule_review",
        "stakeholder_alignment",
        "execution_support",
        "other",
    }
)
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})


def validate_project_management_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "project_type":
        return {
            "project_type": _require_enum(payload.get("project_type"), "project_type", PROJECT_TYPES)
        }

    if step_key == "project_stage":
        return {
            "project_stage": _require_enum(payload.get("project_stage"), "project_stage", PROJECT_STAGES)
        }

    if step_key == "project_context":
        return {
            "project_objective": _require_string(
                payload.get("project_objective"), "project_objective", min_len=10, max_len=2000
            ),
            "current_status": _require_string(
                payload.get("current_status"), "current_status", min_len=5, max_len=2000
            ),
        }

    if step_key == "scope_clarity":
        return {
            "scope_clarity": _require_enum(payload.get("scope_clarity"), "scope_clarity", SCOPE_CLARITY_LEVELS)
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

    if step_key == "budget_context":
        return {
            "budget_state": _require_enum(payload.get("budget_state"), "budget_state", BUDGET_STATES)
        }

    if step_key == "challenges_context":
        result = {
            "main_challenges": _require_string(
                payload.get("main_challenges"), "main_challenges", min_len=5, max_len=2000
            )
        }
        risks = _optional_string(payload.get("top_risks"), "top_risks", max_len=2000)
        if risks is not None:
            result["top_risks"] = risks
        return result

    if step_key == "stakeholder_context":
        result: dict[str, Any] = {}
        notes = _optional_string(payload.get("stakeholder_notes"), "stakeholder_notes", max_len=2000)
        if notes is not None:
            result["stakeholder_notes"] = notes
        return result

    if step_key == "engagement_goal":
        return {
            "engagement_goal": _require_enum(
                payload.get("engagement_goal"), "engagement_goal", ENGAGEMENT_GOALS
            )
        }

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

    raise JourneyValidationError(f"Unknown Project Management step: {step_key}")


def assemble_project_management_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    missing: list[str] = []
    if context.get("scope_clarity") in {None, "unclear", "evolving"}:
        missing.append("توضيح نطاق المشروع والحدود التشغيلية")
    if context.get("budget_state") in {None, "not_defined", "confidential"}:
        missing.append("وضوح إطار الميزانية أو القيود المالية")
    if context.get("project_stage") == "delayed" and not context.get("top_risks"):
        missing.append("توضيح أسباب التعثر أو التأخير الرئيسية")

    considerations = [
        "هذا موجز جاهزية أولي وليس خطة إدارة مشروع معتمدة أو جدولاً تنفيذياً ملزماً.",
        "لا يُعد وعداً بموعد إنجاز أو ميزانية نهائية أو توفر موارد محددة.",
        "يلزم مراجعة مهنية لتأكيد الخطوة التشغيلية التالية.",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز جاهزية إدارة المشروع",
        "understood_request": context.get("project_objective"),
        "project_context": {
            "project_type": context.get("project_type"),
            "project_stage": context.get("project_stage"),
            "current_status": context.get("current_status"),
            "scope_clarity": context.get("scope_clarity"),
        },
        "readiness": {
            "budget_state": context.get("budget_state"),
            "desired_timeline": context.get("desired_timeline"),
            "urgency": context.get("urgency"),
            "engagement_goal": context.get("engagement_goal"),
        },
        "coordination": {
            "main_challenges": context.get("main_challenges"),
            "top_risks": context.get("top_risks"),
            "stakeholder_notes": context.get("stakeholder_notes"),
        },
        "missing_information": missing,
        "preliminary_considerations": considerations,
        "recommended_next_step": "مراجعة مهنية لتحديد خط الأساس الإداري والخطوة التشغيلية التالية",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_project_management_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_project_management_readiness_brief(context)
    return {
        "journey_type": PROJECT_MANAGEMENT_JOURNEY_TYPE,
        "sector_slug": "project-management",
        "project_type": context.get("project_type"),
        "project_stage": context.get("project_stage"),
        "project_objective": context.get("project_objective"),
        "current_status": context.get("current_status"),
        "scope_clarity": context.get("scope_clarity"),
        "desired_timeline": context.get("desired_timeline"),
        "urgency": context.get("urgency"),
        "budget_state": context.get("budget_state"),
        "main_challenges": context.get("main_challenges"),
        "top_risks": context.get("top_risks"),
        "stakeholder_notes": context.get("stakeholder_notes"),
        "engagement_goal": context.get("engagement_goal"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
