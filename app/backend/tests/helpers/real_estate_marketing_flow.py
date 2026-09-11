"""Helper to advance Real Estate Marketing journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_real_estate_marketing_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("marketing_goal", {"marketing_goal": "sell_property"}),
        (
            "property_description",
            {"property_description": "شقة سكنية للبيع — تسويق أولي قبل أي حملة معتمدة"},
        ),
        ("property_location", {"property_location": "الرياض — حي الياسمين"}),
        ("target_audience", {"target_audience": "end_buyers"}),
        ("marketing_stage", {"marketing_stage": "planning"}),
        ("existing_assets", {"existing_assets": "partial"}),
        ("channels_context", {"channels_interest": "منصات رقمية ووسيط محلي"}),
        ("timeline_context", {"target_timeline": "خلال 3 أشهر", "urgency": "soon"}),
        ("budget_context", {}),
        ("summary_review", {}),
        ("marketing_readiness_brief", {}),
        ("scope_confirm", {"scope_confirmed": True}),
        ("submit_confirm", {"submit_confirmed": True}),
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
