"""Domain validators for Real Estate Valuation journey (#05)."""

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

REAL_ESTATE_VALUATION_JOURNEY_TYPE = "real_estate_valuation"

VALUATION_PURPOSES = frozenset(
    {"sale", "purchase", "mortgage", "legal", "inheritance", "tax", "investment", "other"}
)
ASSET_TYPES = frozenset(
    {"villa", "apartment", "land", "commercial", "industrial", "mixed_use", "other"}
)
OWNERSHIP_STATUSES = frozenset(
    {"owned", "under_transaction", "inherited", "leased", "other"}
)
INSPECTION_READINESS = frozenset(
    {"accessible", "tenant_occupied", "remote_only", "not_ready", "unknown"}
)
ENGAGEMENT_GOALS = frozenset(
    {
        "readiness_review",
        "formal_valuation",
        "second_opinion",
        "portfolio_review",
        "other",
    }
)
URGENCY_LEVELS = frozenset({"standard", "soon", "urgent"})


def validate_valuation_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "valuation_purpose":
        return {
            "valuation_purpose": _require_enum(
                payload.get("valuation_purpose"), "valuation_purpose", VALUATION_PURPOSES
            )
        }

    if step_key == "asset_type":
        return {"asset_type": _require_enum(payload.get("asset_type"), "asset_type", ASSET_TYPES)}

    if step_key == "asset_location":
        return {"location": _require_string(payload.get("location"), "location", min_len=2, max_len=120)}

    if step_key == "asset_description":
        result = {
            "asset_description": _require_string(
                payload.get("asset_description"), "asset_description", min_len=10, max_len=2000
            )
        }
        area = payload.get("area_sqm")
        if area is not None and area != "":
            try:
                parsed = float(area)
            except (TypeError, ValueError) as exc:
                raise FieldValidationError(
                    [_error("area_sqm", "invalid_number", "المساحة يجب أن تكون رقماً صالحاً")]
                ) from exc
            if parsed <= 0 or parsed > 1_000_000:
                raise FieldValidationError(
                    [_error("area_sqm", "out_of_range", "المساحة خارج النطاق المسموح")]
                )
            result["area_sqm"] = parsed
        return result

    if step_key == "ownership_context":
        return {
            "ownership_status": _require_enum(
                payload.get("ownership_status"), "ownership_status", OWNERSHIP_STATUSES
            )
        }

    if step_key == "document_readiness":
        result: dict[str, Any] = {}
        for field in ("deed_available", "title_docs_available", "rent_roll_available", "plans_available"):
            value = _optional_bool(payload.get(field), field)
            if value is not None:
                result[field] = value
        notes = _optional_string(payload.get("document_notes"), "document_notes", max_len=2000)
        if notes is not None:
            result["document_notes"] = notes
        return result

    if step_key == "inspection_readiness":
        return {
            "inspection_readiness": _require_enum(
                payload.get("inspection_readiness"), "inspection_readiness", INSPECTION_READINESS
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

    if step_key == "engagement_goal":
        return {
            "engagement_goal": _require_enum(
                payload.get("engagement_goal"), "engagement_goal", ENGAGEMENT_GOALS
            )
        }

    if step_key in {"summary_review", "readiness_brief"}:
        return {}

    if step_key == "scope_confirm":
        confirmed = payload.get("scope_confirmed")
        if confirmed is not True:
            raise FieldValidationError(
                [_error("scope_confirmed", "required", "يلزم تأكيد دقة المعلومات للمتابعة")]
            )
        return {"scope_confirmed": True}

    if step_key == "submit_confirm":
        confirmed = payload.get("submit_confirmed")
        if confirmed is not True:
            raise FieldValidationError(
                [_error("submit_confirmed", "required", "يلزم تأكيد رغبتك في إرسال الطلب")]
            )
        return {"submit_confirmed": True}

    raise JourneyValidationError(f"Unknown Valuation step: {step_key}")


def assemble_valuation_readiness_brief(context: dict[str, Any]) -> dict[str, Any]:
    missing: list[str] = []
    if not context.get("deed_available") and not context.get("title_docs_available"):
        missing.append("مستندات ملكية / صك")
    if context.get("inspection_readiness") in {None, "not_ready", "unknown"}:
        missing.append("جاهزية المعاينة الميدانية")
    if context.get("engagement_goal") == "formal_valuation" and not context.get("plans_available"):
        missing.append("مخططات أو مستندات داعمة للتقييم")
    if context.get("valuation_purpose") in {"mortgage", "legal", "tax"} and not context.get(
        "title_docs_available"
    ):
        missing.append("مستندات مطلوبة لغرض التقييم المُعلَن")

    considerations = [
        "هذا موجز جاهزية أولي وليس تقرير تقييم معتمد أو شهادة قيمة رسمية.",
        "لا يُعد تقديراً سعرياً نهائياً أو اعتماداً مهنياً أو التزاماً قانونياً.",
        "يلزم مراجعة مهنية ومعاينة/تحقق قبل أي قرار يعتمد على القيمة.",
    ]

    return {
        "status": "PRELIMINARY",
        "assistance": "RULE_ASSISTED",
        "professional_review_required": True,
        "title": "موجز جاهزية التقييم العقاري",
        "understood_request": context.get("asset_description"),
        "valuation_context": {
            "valuation_purpose": context.get("valuation_purpose"),
            "asset_type": context.get("asset_type"),
            "location": context.get("location"),
            "area_sqm": context.get("area_sqm"),
            "ownership_status": context.get("ownership_status"),
        },
        "readiness": {
            "inspection_readiness": context.get("inspection_readiness"),
            "engagement_goal": context.get("engagement_goal"),
            "desired_timeline": context.get("desired_timeline"),
        },
        "documents_context": {
            "deed_available": context.get("deed_available"),
            "title_docs_available": context.get("title_docs_available"),
            "rent_roll_available": context.get("rent_roll_available"),
            "plans_available": context.get("plans_available"),
            "document_notes": context.get("document_notes"),
        },
        "missing_information": missing,
        "preliminary_considerations": considerations,
        "recommended_next_step": "مراجعة مهنية لتحديد جاهزية التقييم والخطوة التالية",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def assemble_valuation_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    brief = context.get("preliminary_brief") or assemble_valuation_readiness_brief(context)
    return {
        "journey_type": REAL_ESTATE_VALUATION_JOURNEY_TYPE,
        "sector_slug": "real-estate-valuation",
        "valuation_purpose": context.get("valuation_purpose"),
        "asset_type": context.get("asset_type"),
        "location": context.get("location"),
        "asset_description": context.get("asset_description"),
        "area_sqm": context.get("area_sqm"),
        "ownership_status": context.get("ownership_status"),
        "deed_available": context.get("deed_available"),
        "title_docs_available": context.get("title_docs_available"),
        "rent_roll_available": context.get("rent_roll_available"),
        "plans_available": context.get("plans_available"),
        "document_notes": context.get("document_notes"),
        "inspection_readiness": context.get("inspection_readiness"),
        "desired_timeline": context.get("desired_timeline"),
        "urgency": context.get("urgency"),
        "engagement_goal": context.get("engagement_goal"),
        "preliminary_brief": brief,
        "scope_confirmed": context.get("scope_confirmed"),
        "submit_confirmed": context.get("submit_confirmed"),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
