"""Helper to advance Facility Management journey through V1 steps in tests."""

from __future__ import annotations

from services.jos import JosService


async def advance_facility_management_v1_to_terminal(
    jos: JosService,
    instance_id: int,
    anonymous_session_id: str,
) -> None:
    steps = [
        ("facility_type", {"facility_type": "commercial"}),
        ("asset_location", {"location": "الرياض — برج مكتبي"}),
        ("facility_scope", {"facility_scope": "full_building"}),
        ("operational_challenge", {"operational_challenge": "operations_efficiency"}),
        ("service_maturity", {"service_maturity": "mixed"}),
        ("engagement_goal", {"engagement_goal": "readiness_review"}),
        ("timeline_context", {"target_timeline": "خلال شهر", "urgency": "soon"}),
        ("readiness_context", {"current_readiness": "عمليات جزئية بدون عقد موحد"}),
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
