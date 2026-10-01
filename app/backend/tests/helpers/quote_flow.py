"""Shared quote test helpers."""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from services.jos import JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.quotes import QuoteService
from services.service_requests import ServiceRequestService
from tests.helpers.build_villa_flow import advance_build_villa_v1_to_terminal


async def create_qualified_sr_with_user(
    db_session: AsyncSession,
    user_id: str = "accept-customer-1",
) -> tuple:
    await upsert_journey_definition(
        db_session,
        {
            "journey_type": "build_villa",
            "name": "Build Villa Discovery",
            "description": "Test",
            "workflow_definition": BUILD_VILLA_WORKFLOW,
        },
    )
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    session_id = f"anon-{user_id}"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None
    await sr_service.start_professional_review(sr.id, actor_user_id="admin-1")
    await sr_service.mark_qualified(sr.id, actor_user_id="admin-1")
    await db_session.flush()
    return sr, user_id


async def issue_quote_for_sr(db_session: AsyncSession, service_request_id: int) -> None:
    qs = QuoteService(db_session)
    quote = await qs.create_draft(service_request_id, created_by_user_id="ops@test")
    await qs.add_line_item(quote.id, description="Service", quantity=Decimal("1"), unit_price=Decimal("1000"))
    await qs.submit_for_approval(quote.id)
    await qs.approve(quote.id, approved_by_user_id="ops@test")
    await qs.issue(quote.id)
