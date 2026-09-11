"""Shared Build Villa V1 advance payloads for tests."""

from __future__ import annotations

from services.build_villa_schema import BUILD_VILLA_STEP_ORDER
from services.jos import JosService

BUILD_VILLA_M1_LEGACY_ADVANCE_SEQUENCE: list[dict] = [
    {"city": "Jeddah"},
    {"land_ownership_type": "owned"},
    {"land_area_sqm": 750},
    {},
    {"desired_service": "full_service"},
]

BUILD_VILLA_WO003_LEGACY_ADVANCE_SEQUENCE: list[dict] = [
    *BUILD_VILLA_M1_LEGACY_ADVANCE_SEQUENCE,
    {},
    {"scope_confirmed": True},
]

BUILD_VILLA_V1_ADVANCE_SEQUENCE: list[dict] = [
    {"project_objective": "أريد بناء فيلا عائلية للسكن الدائم"},
    {"city": "Jeddah"},
    {"land_ownership_type": "owned"},
    {"land_area_sqm": 750},
    {"household_size": 6, "use_summary": "عائلة من 6 أفراد مع حاجة للخصوصية"},
    {"bedrooms": 5, "selected_spaces": ["guest_majlis", "family_living", "kitchen", "parking"]},
    {"budget_range": "2m_5m"},
    {"desired_start": "within_6_months", "urgency": "standard"},
    {"design_style": "contemporary"},
    {},
    {"desired_service": "full_service"},
    {},
    {},
    {"scope_confirmed": True},
    {"submit_confirmed": True},
]


def advance_sequence_for_initial_step(initial_step: str) -> list[dict]:
    if initial_step == "project_intent":
        return BUILD_VILLA_V1_ADVANCE_SEQUENCE
    if initial_step == "city":
        return BUILD_VILLA_WO003_LEGACY_ADVANCE_SEQUENCE
    raise AssertionError(f"Unsupported Build Villa initial step: {initial_step}")


def payload_for_legacy_step(step_key: str) -> dict:
    mapping: dict[str, dict] = {
        "city": {"city": "Jeddah"},
        "land_ownership": {"land_ownership_type": "owned"},
        "land_area": {"land_area_sqm": 750},
        "documents_context": {},
        "desired_service": {"desired_service": "full_service"},
        "brief_review": {},
        "scope_confirm": {"scope_confirmed": True},
        "submit_confirm": {"submit_confirmed": True},
    }
    return mapping.get(step_key, {})


async def advance_build_villa_v1_to_step(
    service: JosService,
    instance_id: int,
    session_id: str,
    target_step: str,
):
    """Advance until the instance reaches target_step (inclusive landing step)."""
    instance = await service.get_instance(instance_id)
    assert instance is not None
    for payload in BUILD_VILLA_V1_ADVANCE_SEQUENCE:
        if instance.current_step_key == target_step:
            return instance
        instance = await service.advance(instance_id, input_data=payload, anonymous_session_id=session_id)
    if instance.current_step_key == target_step:
        return instance
    raise AssertionError(f"Expected step {target_step}, got {instance.current_step_key}")


async def advance_build_villa_v1_from_step(
    service: JosService,
    instance_id: int,
    session_id: str,
    from_step: str,
    *,
    payloads: list[dict] | None = None,
):
    """Continue advancing from from_step until intake_complete."""
    instance = await service.get_instance(instance_id)
    assert instance is not None
    assert instance.current_step_key == from_step
    start_index = BUILD_VILLA_STEP_ORDER.index(from_step)
    sequence = payloads if payloads is not None else BUILD_VILLA_V1_ADVANCE_SEQUENCE[start_index:]
    for payload in sequence:
        instance = await service.advance(instance_id, input_data=payload, anonymous_session_id=session_id)
    return instance


async def advance_build_villa_v1_to_terminal(service: JosService, instance_id: int, session_id: str):
    instance = None
    for payload in BUILD_VILLA_V1_ADVANCE_SEQUENCE:
        instance = await service.advance(instance_id, input_data=payload, anonymous_session_id=session_id)
    assert instance is not None
    assert instance.current_step_key == "intake_complete"
    assert instance.context.get("intake_draft")
    assert instance.context.get("preliminary_brief")
    return instance


async def advance_build_villa_via_http(client, instance_id: int, headers: dict, initial_step: str):
    """Advance a Build Villa instance through the API using the correct workflow sequence."""
    for payload in advance_sequence_for_initial_step(initial_step):
        response = await client.post(
            f"/api/v1/jos/instances/{instance_id}/advance",
            json={"input": payload},
            headers=headers,
        )
        assert response.status_code == 200, response.text
