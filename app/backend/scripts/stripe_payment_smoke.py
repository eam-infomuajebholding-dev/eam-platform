"""API smoke: issued quote → Stripe Checkout URL (requires STRIPE_SECRET_KEY in app/.env)."""

from __future__ import annotations

import asyncio
import sys
from decimal import Decimal
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from core.config import load_project_env

load_project_env()

from core.auth import create_access_token  # noqa: E402
from core.database import Base, db_manager  # noqa: E402
from services.jos import JosService  # noqa: E402
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition  # noqa: E402
from services.quote_payments import QuotePaymentService  # noqa: E402
from services.quotes import QuoteService  # noqa: E402
from services.service_requests import ServiceRequestService  # noqa: E402
from tests.helpers.build_villa_flow import advance_build_villa_v1_to_terminal  # noqa: E402


async def _ensure_schema() -> None:
    await db_manager.ensure_initialized()
    assert db_manager.engine is not None
    async with db_manager.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def _seed_issued_quote(user_id: str = "stripe-smoke-customer") -> tuple[int, str]:
    assert db_manager.async_session_maker is not None
    async with db_manager.async_session_maker() as session:
        await upsert_journey_definition(
            session,
            {
                "journey_type": "build_villa",
                "name": "Build Villa Discovery",
                "description": "Stripe smoke",
                "workflow_definition": BUILD_VILLA_WORKFLOW,
            },
        )
        jos = JosService(session)
        sr_service = ServiceRequestService(session)
        quote_service = QuoteService(session)
        session_id = f"anon-{user_id}"
        instance = await jos.start_journey("build_villa", anonymous_session_id=session_id, user_id=user_id)
        instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
        await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_id)
        sr = await sr_service.get_by_journey_instance_id(instance.id)
        assert sr is not None
        await sr_service.start_professional_review(sr.id, actor_user_id="admin-1")
        await sr_service.mark_qualified(sr.id, actor_user_id="admin-1")
        quote = await quote_service.create_draft(sr.id, created_by_user_id="admin-1")
        quote = await quote_service.add_line_item(
            quote.id,
            description="Stripe smoke — consulting line",
            quantity=Decimal("1"),
            unit_price=Decimal("1000.00"),
        )
        quote = await quote_service.submit_for_approval(quote.id)
        quote = await quote_service.approve(quote.id, approved_by_user_id="owner-1")
        quote = await quote_service.issue(quote.id)
        await session.commit()
        return sr.id, user_id


async def _check_env_only() -> None:
    from scripts.verify_stripe_env import main as verify_main

    verify_main()
    await _ensure_schema()
    print("DB_SCHEMA: OK")


async def main() -> None:
    import os

    if "--check-env" in sys.argv:
        await _check_env_only()
        return

    key = os.environ.get("STRIPE_SECRET_KEY", "").strip()
    if not key or key.startswith("sk_test_..."):
        print("ERROR: Set STRIPE_SECRET_KEY in app/.env (sk_test_... from Stripe Dashboard)")
        print("Dry-run: python scripts/stripe_payment_smoke.py --check-env")
        sys.exit(1)

    await _ensure_schema()
    request_id, user_id = await _seed_issued_quote()

    assert db_manager.async_session_maker is not None
    async with db_manager.async_session_maker() as session:
        result = await QuotePaymentService(session).create_checkout_session(
            request_id,
            user_id=user_id,
            customer_email=f"{user_id}@example.com",
        )
        await session.commit()

    token = create_access_token(
        {"sub": user_id, "email": f"{user_id}@example.com", "name": "Stripe Smoke", "role": "user"},
        expires_minutes=60,
    )
    frontend = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/")

    print("STRIPE_PAYMENT_SMOKE_OK")
    print(f"service_request_id: {request_id}")
    print(f"checkout_session_id: {result['session_id']}")
    print(f"checkout_url: {result['url']}")
    print(f"customer_jwt: {token[:20]}…")
    print(f"my_requests: {frontend}/my-requests/{request_id}")
    print(f"success_return: {frontend}/payment/success?session_id={{CHECKOUT_SESSION_ID}}")
    print("")
    print("Test card: 4242 4242 4242 4242 · any future expiry · any CVC")
    print("With stripe listen running, webhook will mark quote paid after checkout.")


if __name__ == "__main__":
    asyncio.run(main())
