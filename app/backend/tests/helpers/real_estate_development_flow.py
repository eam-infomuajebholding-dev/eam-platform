"""Helper to advance Real Estate Development journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_real_estate_development_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("asset_context", {"asset_context": "owned_land"}),
        ("asset_location", {"asset_location": "الرياض — حي النرجس"}),
        (
            "development_objective",
            {
                "development_objective": "استكشاف خيارات تطوير أرض سكنية بشكل أولي قبل أي دراسة جدوى"
            },
        ),
        ("intended_use", {"intended_use": "residential"}),
        ("current_status", {"current_status": "vacant_land"}),
        ("constraints_context", {}),
        ("documents_readiness", {"documents_readiness": "have_partial"}),
        ("timeline_context", {"target_timeline": "خلال 6 أشهر", "urgency": "soon"}),
        ("summary_review", {}),
        ("opportunity_snapshot_brief", {}),
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
