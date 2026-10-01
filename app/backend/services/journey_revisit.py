"""Shared step-revisit rules for all JOS journeys."""

from __future__ import annotations

from typing import Any

from services.jos_validators import workflow_step_order

TERMINAL_STEP_KEYS = frozenset({"intake_complete", "handoff_complete"})

NON_REVISITABLE_STEP_FRAGMENTS = (
    "_confirm",
    "confirm_",
    "brief",
    "summary_review",
    "handoff",
    "procurement_invoice",
)

DERIVED_CONTEXT_KEYS = (
    "preliminary_brief",
    "intake_draft",
    "draft_status",
    "scope_confirmed",
    "submit_confirmed",
    "invoice_confirmed",
    "buyer_liability_terms_accepted",
    "buyer_liability_terms_version",
    "buyer_liability_terms_accepted_at",
    "internal_review_and_approval",
    "procurement_invoice",
    "phone_verified",
    "phone_otp_hash",
    "phone_otp_expires_at",
)


def revisit_blocked_step_keys(workflow: dict[str, Any]) -> frozenset[str]:
    blocked: set[str] = set(TERMINAL_STEP_KEYS)
    for step in workflow.get("steps", []):
        key = step.get("key")
        if not isinstance(key, str):
            continue
        if step.get("terminal") is True:
            blocked.add(key)
        lowered = key.lower()
        if any(fragment in lowered for fragment in NON_REVISITABLE_STEP_FRAGMENTS):
            blocked.add(key)
    return frozenset(blocked)


def first_downstream_artifact_index(order: list[str]) -> int:
    gates: list[int] = []
    for index, key in enumerate(order):
        lowered = key.lower()
        if any(fragment in lowered for fragment in NON_REVISITABLE_STEP_FRAGMENTS):
            gates.append(index)
    return min(gates) if gates else len(order)


def invalidate_context_for_revisit(
    context: dict[str, Any],
    *,
    order: list[str],
    target_index: int,
) -> dict[str, Any]:
    updated = dict(context)
    if target_index < first_downstream_artifact_index(order):
        for key in DERIVED_CONTEXT_KEYS:
            updated.pop(key, None)
    return updated
