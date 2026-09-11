"""Helper to advance Real Estate Valuation journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_valuation_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("valuation_purpose", {"valuation_purpose": "sale"}),
        ("asset_type", {"asset_type": "villa"}),
        ("asset_location", {"location": "الرياض"}),
        (
            "asset_description",
            {
                "asset_description": "فيلا سكنية في حي راقٍ بحاجة لتقييم قبل البيع",
                "area_sqm": 450,
            },
        ),
        ("ownership_context", {"ownership_status": "owned"}),
        ("document_readiness", {"deed_available": True, "title_docs_available": False}),
        ("inspection_readiness", {"inspection_readiness": "accessible"}),
        ("timeline_context", {"desired_timeline": "خلال شهر", "urgency": "soon"}),
        ("engagement_goal", {"engagement_goal": "formal_valuation"}),
        ("summary_review", {}),
        ("readiness_brief", {}),
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
