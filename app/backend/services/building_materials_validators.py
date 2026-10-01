"""Domain validators for Building Materials journey (#10)."""

from __future__ import annotations

import hashlib
import logging
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

from services.build_villa_validators import (
    FieldValidationError,
    _error,
    _optional_string,
    _require_string,
)
from services.building_materials_legal_terms import (
    BUYER_LIABILITY_TERMS_VERSION,
    buyer_liability_terms_payload,
    internal_review_and_approval_payload,
)
from services.jos_validators import JourneyValidationError

logger = logging.getLogger(__name__)

BUILDING_MATERIALS_JOURNEY_TYPE = "building_materials"

INTAKE_CHANNELS = frozenset({"image", "assistant_text", "audio_transcript", "mixed"})
VAT_RATE = Decimal("0.15")
TWOPLACES = Decimal("0.01")
PROVISIONAL_UNIT_PRICE = Decimal("100.00")


def _quantize(value: Decimal) -> Decimal:
    return value.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def _normalize_phone(raw: str) -> str:
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("966"):
        digits = digits[3:]
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) != 9 or not digits.startswith("5"):
        raise FieldValidationError([_error("requester_phone", "invalid", "أدخل رقم جوال سعودي صحيح (05xxxxxxxx)")])
    return f"+966{digits}"


def _hash_otp(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def create_phone_otp_challenge(phone: str) -> dict[str, Any]:
    normalized = _normalize_phone(phone)
    dev_code = os.environ.get("JOURNEY_DEV_OTP", "").strip()
    code = dev_code if dev_code else f"{secrets.randbelow(900000) + 100000:06d}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    if dev_code:
        logger.info("building_materials OTP (dev) for %s: %s", normalized, code)
    else:
        logger.info("building_materials OTP issued for %s (SMS provider not configured)", normalized)
    return {
        "requester_phone_normalized": normalized,
        "phone_otp_hash": _hash_otp(code),
        "phone_otp_expires_at": expires_at.isoformat(),
        "phone_verified": False,
    }


def parse_materials_line_items(context: dict[str, Any]) -> list[dict[str, Any]]:
    parts: list[str] = []
    materials_list = (context.get("materials_list") or "").strip()
    transcript = (context.get("assistant_transcript") or "").strip()
    if materials_list:
        parts.extend(materials_list.splitlines())
    if transcript:
        parts.extend(transcript.splitlines())

    items: list[dict[str, Any]] = []
    for raw_line in parts:
        line = raw_line.strip().lstrip("-•").strip()
        if not line:
            continue
        quantity = Decimal("1")
        unit = "وحدة"
        description = line

        pipe_match = [segment.strip() for segment in line.split("|") if segment.strip()]
        if len(pipe_match) >= 2:
            description = pipe_match[0]
            try:
                quantity = Decimal(pipe_match[1].replace(",", "."))
            except Exception:
                quantity = Decimal("1")
            if len(pipe_match) >= 3:
                unit = pipe_match[2]
        else:
            qty_match = re.search(r"(\d+(?:\.\d+)?)\s*(كيس|طن|قطعة|م3|متر|لفة|كيس|كرتون|unit)?", line)
            if qty_match:
                quantity = Decimal(qty_match.group(1))
                if qty_match.group(2):
                    unit = qty_match.group(2)

        unit_price = PROVISIONAL_UNIT_PRICE
        line_total = _quantize(quantity * unit_price)
        items.append(
            {
                "description": description,
                "quantity": float(quantity),
                "unit": unit,
                "unit_price": float(unit_price),
                "line_total": float(line_total),
            }
        )

    if not items and context.get("materials_image_url"):
        items.append(
            {
                "description": "مواد من مرفق صورة — REQUIRES_VERIFICATION",
                "quantity": 1.0,
                "unit": "طلب",
                "unit_price": None,
                "line_total": None,
            }
        )

    return items


def assemble_procurement_invoice(context: dict[str, Any]) -> dict[str, Any]:
    line_items = parse_materials_line_items(context)
    priced = [item for item in line_items if item.get("line_total") is not None]
    subtotal = _quantize(sum(Decimal(str(item["line_total"])) for item in priced)) if priced else None
    vat_amount = _quantize(subtotal * VAT_RATE) if subtotal is not None else None
    total_amount = _quantize(subtotal + vat_amount) if subtotal is not None and vat_amount is not None else None

    return {
        "title": "فاتورة توريد مواد البناء",
        "status": "PROVISIONAL",
        "currency": "SAR",
        "line_items": line_items,
        "subtotal": float(subtotal) if subtotal is not None else None,
        "vat_amount": float(vat_amount) if vat_amount is not None else None,
        "total_amount": float(total_amount) if total_amount is not None else None,
        "delivery_location": context.get("delivery_location"),
        "requester_name": context.get("requester_name"),
        "requester_phone": context.get("requester_phone_normalized") or context.get("requester_phone"),
        "materials_image_url": context.get("materials_image_url"),
        "intake_channel": context.get("intake_channel"),
        "payment_note": (
            "هذه فاتورة أولية للتأكيد. بعد إرسال الطلب، يمكن إتمام الدفع من «طلباتي» "
            "عند إصدار عرض السعر النهائي."
        ),
        "buyer_liability_terms": buyer_liability_terms_payload(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def validate_building_materials_step(step_key: str, input_data: dict[str, Any] | None) -> dict[str, Any]:
    payload = input_data or {}
    if not isinstance(payload, dict):
        raise FieldValidationError([_error("input", "invalid_type", "Advance input must be a JSON object")])

    if step_key == "materials_intake":
        channel = (payload.get("intake_channel") or "mixed").strip()
        if channel not in INTAKE_CHANNELS:
            raise FieldValidationError([_error("intake_channel", "invalid", "قناة الإدخال غير مدعومة")])
        materials_list = _optional_string(payload.get("materials_list"), "materials_list", max_len=4000) or ""
        transcript = _optional_string(payload.get("assistant_transcript"), "assistant_transcript", max_len=4000) or ""
        image_url = _optional_string(payload.get("materials_image_url"), "materials_image_url", max_len=500)
        if not materials_list.strip() and not transcript.strip() and not image_url:
            raise FieldValidationError(
                [
                    _error(
                        "materials_list",
                        "required",
                        "أدخل قائمة المواد أو ارفع صورة أو الصق نص المساعد/الصوت",
                    )
                ]
            )
        result: dict[str, Any] = {"intake_channel": channel}
        if materials_list.strip():
            result["materials_list"] = materials_list.strip()
        if transcript.strip():
            result["assistant_transcript"] = transcript.strip()
        if image_url:
            result["materials_image_url"] = image_url
        return result

    if step_key == "requester_identity":
        return {
            "requester_name": _require_string(payload.get("requester_name"), "requester_name", min_len=2, max_len=120),
            "requester_phone": _normalize_phone(
                _require_string(payload.get("requester_phone"), "requester_phone", min_len=9, max_len=20)
            ),
        }

    if step_key == "phone_verification":
        code = _require_string(payload.get("otp_code"), "otp_code", min_len=4, max_len=8)
        return {"otp_code": code.strip()}

    if step_key == "delivery_location":
        return {
            "delivery_location": _require_string(
                payload.get("delivery_location"), "delivery_location", min_len=5, max_len=300
            )
        }

    if step_key in {"procurement_invoice"}:
        return {}

    if step_key == "invoice_confirm":
        errors: list[dict[str, Any]] = []
        if payload.get("invoice_confirmed") is not True:
            errors.append(_error("invoice_confirmed", "required", "يلزم تأكيد الفاتورة للمتابعة"))
        if payload.get("buyer_liability_terms_accepted") is not True:
            errors.append(
                _error(
                    "buyer_liability_terms_accepted",
                    "required",
                    "يلزم الموافقة على شروط تحمّل المشتري لتكاليف النقل والمصاريف",
                )
            )
        if errors:
            raise FieldValidationError(errors)
        return {
            "invoice_confirmed": True,
            "buyer_liability_terms_accepted": True,
            "buyer_liability_terms_version": BUYER_LIABILITY_TERMS_VERSION,
            "buyer_liability_terms_accepted_at": datetime.now(timezone.utc).isoformat(),
        }

    raise JourneyValidationError(f"Unknown Building Materials step: {step_key}")


def validate_phone_otp(context: dict[str, Any], otp_code: str) -> dict[str, Any]:
    expected_hash = context.get("phone_otp_hash")
    if not expected_hash:
        raise FieldValidationError([_error("otp_code", "invalid", "لم يُرسل رمز تحقق. ارجع خطوة للخلف.")])
    expires_raw = context.get("phone_otp_expires_at")
    if expires_raw:
        expires_at = datetime.fromisoformat(str(expires_raw))
        if datetime.now(timezone.utc) > expires_at:
            raise FieldValidationError([_error("otp_code", "expired", "انتهت صلاحية الرمز. أعد إرسال الرمز.")])
    if _hash_otp(otp_code.strip()) != expected_hash:
        raise FieldValidationError([_error("otp_code", "invalid", "رمز التحقق غير صحيح")])
    return {"phone_verified": True}


def assemble_building_materials_intake_draft(context: dict[str, Any]) -> dict[str, Any]:
    invoice = context.get("procurement_invoice") or assemble_procurement_invoice(context)
    return {
        "journey_type": BUILDING_MATERIALS_JOURNEY_TYPE,
        "sector_slug": "building-materials",
        "intake_channel": context.get("intake_channel"),
        "materials_list": context.get("materials_list"),
        "materials_image_url": context.get("materials_image_url"),
        "assistant_transcript": context.get("assistant_transcript"),
        "requester_name": context.get("requester_name"),
        "requester_phone": context.get("requester_phone_normalized") or context.get("requester_phone"),
        "phone_verified": context.get("phone_verified"),
        "delivery_location": context.get("delivery_location"),
        "procurement_invoice": invoice,
        "invoice_confirmed": context.get("invoice_confirmed"),
        "buyer_liability_terms_accepted": context.get("buyer_liability_terms_accepted"),
        "buyer_liability_terms_version": context.get("buyer_liability_terms_version"),
        "buyer_liability_terms_accepted_at": context.get("buyer_liability_terms_accepted_at"),
        "internal_review_and_approval": internal_review_and_approval_payload(
            buyer_liability_terms_version=context.get("buyer_liability_terms_version"),
            buyer_liability_terms_accepted_at=context.get("buyer_liability_terms_accepted_at"),
            invoice_confirmed=context.get("invoice_confirmed"),
        ),
        "draft_status": "ready_for_handoff",
        "assembled_at": datetime.now(timezone.utc).isoformat(),
    }
