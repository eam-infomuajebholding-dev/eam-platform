"""Helper to advance Building Materials journey through V2 steps in tests."""

from __future__ import annotations

import os

from services.jos import JosService


async def advance_building_materials_v2_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    os.environ.setdefault("JOURNEY_DEV_OTP", "123456")
    steps = [
        (
            "materials_intake",
            {
                "intake_channel": "assistant_text",
                "materials_list": "أسمنت 50 كيس\nحديد 12مم 2 طن",
            },
        ),
        (
            "requester_identity",
            {"requester_name": "أحمد العميل", "requester_phone": "0512345678"},
        ),
        ("phone_verification", {"otp_code": "123456"}),
        ("delivery_location", {"delivery_location": "الرياض — حي النرجس، شارع 10"}),
        ("procurement_invoice", {}),
        (
            "invoice_confirm",
            {"invoice_confirmed": True, "buyer_liability_terms_accepted": True},
        ),
    ]

    for step_key, payload in steps:
        instance = await jos.get_instance(instance_id)
        assert instance is not None
        assert instance.current_step_key == step_key, f"expected {step_key}, got {instance.current_step_key}"
        await jos.advance(
            instance_id,
            input_data=payload,
            anonymous_session_id=anonymous_session_id,
        )
