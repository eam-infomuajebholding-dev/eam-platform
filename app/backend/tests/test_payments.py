"""Stripe quote payment flow tests."""

from __future__ import annotations

import json
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from httpx import ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.auth import create_access_token
from core.database import Base
from main import app
from models.payments import (
    PAYMENT_STATUS_COMPLETED,
    PAYMENT_STATUS_EXPIRED,
    PAYMENT_STATUS_FAILED,
    PAYMENT_STATUS_PENDING,
    Payment,
)
from models.quotes import QUOTE_STATUS_PAID
from models.stripe_webhook_events import StripeWebhookEvent
from services.jos import JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.quote_payments import QuotePaymentError, QuotePaymentService, _amount_to_cents
from services.quotes import QuoteService
from services.service_requests import ServiceRequestService
from tests.helpers.build_villa_flow import advance_build_villa_v1_to_terminal


@pytest.fixture(autouse=True)
def payment_env(monkeypatch: pytest.MonkeyPatch):
    from core.config import settings

    monkeypatch.setenv("JWT_SECRET_KEY", "test-jwt-secret")
    monkeypatch.setenv("JWT_EXPIRE_MINUTES", "60")
    monkeypatch.setenv("JWT_ALGORITHM", "HS256")
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_fake")
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test_fake")
    monkeypatch.setenv("FRONTEND_URL", "http://localhost:3000")
    for cache_key in ("stripe_secret_key", "stripe_webhook_secret"):
        settings.__dict__.pop(cache_key, None)


def auth_headers(user_id: str, email: str | None = None) -> dict[str, str]:
    token = create_access_token(
        {"sub": user_id, "email": email or f"{user_id}@example.com", "name": "Customer", "role": "user"},
        expires_minutes=60,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        await upsert_journey_definition(
            session,
            {
                "journey_type": "build_villa",
                "name": "Build Villa Discovery",
                "description": "Test",
                "workflow_definition": BUILD_VILLA_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


async def _issued_quote(db_session: AsyncSession, user_id: str = "pay-customer-1"):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    quote_service = QuoteService(db_session)
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
        description="خدمة استشارية",
        quantity=Decimal("1"),
        unit_price=Decimal("1000.00"),
    )
    quote = await quote_service.submit_for_approval(quote.id)
    quote = await quote_service.approve(quote.id, approved_by_user_id="owner-1")
    quote = await quote_service.issue(quote.id)
    await db_session.commit()
    return sr, quote


@pytest.mark.asyncio
async def test_payment_status_for_issued_quote(db_session: AsyncSession):
    sr, quote = await _issued_quote(db_session)
    service = QuotePaymentService(db_session)
    status = await service.get_payment_status(sr.id, user_id=sr.user_id)
    assert status["can_pay"] is True
    assert status["paid"] is False
    assert status["quote_id"] == quote.id
    assert status["payments_enabled"] is True


@pytest.mark.asyncio
async def test_ops_payment_status(db_session: AsyncSession):
    sr, quote = await _issued_quote(db_session)
    service = QuotePaymentService(db_session)
    status = await service.get_ops_payment_status(sr.id)
    assert status["quote_id"] == quote.id
    assert status["payments_enabled"] is True


@pytest.mark.asyncio
async def test_create_checkout_session_persists_payment(db_session: AsyncSession):
    sr, quote = await _issued_quote(db_session)
    fake_session = SimpleNamespace(id="cs_test_123", url="https://checkout.stripe.test/cs_test_123")

    with patch("services.quote_payments.initialize_stripe", new=AsyncMock()), patch(
        "services.quote_payments.stripe.checkout.Session.create_async",
        new=AsyncMock(return_value=fake_session),
    ):
        service = QuotePaymentService(db_session)
        result = await service.create_checkout_session(sr.id, user_id=sr.user_id, customer_email="c@example.com")
        await db_session.commit()

    assert result["session_id"] == "cs_test_123"
    assert result["url"].startswith("https://checkout.stripe.test")

    payment = await service._get_payment_by_session_id("cs_test_123")
    assert payment is not None
    assert payment.status == PAYMENT_STATUS_PENDING
    assert payment.quote_id == quote.id


@pytest.mark.asyncio
async def test_webhook_marks_quote_paid(db_session: AsyncSession):
    sr, quote = await _issued_quote(db_session)
    payment = Payment(
        quote_id=quote.id,
        service_request_id=sr.id,
        user_id=sr.user_id,
        stripe_checkout_session_id="cs_test_paid",
        amount=quote.total_amount,
        currency="SAR",
        status=PAYMENT_STATUS_PENDING,
    )
    db_session.add(payment)
    await db_session.commit()

    payload_dict = {
        "id": "evt_test",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_paid",
                "payment_status": "paid",
                "payment_intent": "pi_test_1",
                "amount_total": _amount_to_cents(quote.total_amount),
                "currency": "sar",
            }
        },
    }
    payload = json.dumps(payload_dict).encode()

    with patch("services.quote_payments.initialize_stripe", new=AsyncMock()), patch(
        "services.quote_payments.stripe.PaymentIntent.retrieve_async",
        new=AsyncMock(return_value=SimpleNamespace(latest_charge=SimpleNamespace(receipt_url="https://stripe.test/receipt"))),
    ), patch("services.quote_payments.stripe.Webhook.construct_event", return_value=payload_dict):
        service = QuotePaymentService(db_session)
        await service.handle_webhook_event(payload, "sig_test")
        await db_session.commit()

    await db_session.refresh(payment)
    refreshed_quote = await QuoteService(db_session).get_by_id(quote.id)
    assert payment.status == PAYMENT_STATUS_COMPLETED
    assert payment.stripe_receipt_url == "https://stripe.test/receipt"
    assert refreshed_quote is not None
    assert refreshed_quote.status == QUOTE_STATUS_PAID

    activity = await ServiceRequestService(db_session).list_customer_activity(sr.id)
    payment_events = [
        row for row in activity if (row.metadata_json or {}).get("event") == "payment_received"
    ]
    assert len(payment_events) == 1
    assert payment_events[0].customer_message


@pytest.mark.asyncio
async def test_webhook_idempotency_skips_duplicate_event(db_session: AsyncSession):
    sr, quote = await _issued_quote(db_session)
    payment = Payment(
        quote_id=quote.id,
        service_request_id=sr.id,
        user_id=sr.user_id,
        stripe_checkout_session_id="cs_test_dup",
        amount=quote.total_amount,
        currency="SAR",
        status=PAYMENT_STATUS_PENDING,
    )
    db_session.add(payment)
    await db_session.commit()

    payload_dict = {
        "id": "evt_duplicate",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_dup",
                "payment_status": "paid",
                "payment_intent": "pi_dup",
                "amount_total": _amount_to_cents(quote.total_amount),
                "currency": "sar",
            }
        },
    }
    payload = json.dumps(payload_dict).encode()

    with patch("services.quote_payments.initialize_stripe", new=AsyncMock()), patch(
        "services.quote_payments.stripe.PaymentIntent.retrieve_async",
        new=AsyncMock(return_value=SimpleNamespace(latest_charge=None)),
    ), patch("services.quote_payments.stripe.Webhook.construct_event", return_value=payload_dict):
        service = QuotePaymentService(db_session)
        await service.handle_webhook_event(payload, "sig_test")
        await service.handle_webhook_event(payload, "sig_test")
        await db_session.commit()

    from sqlalchemy import select

    events = await db_session.execute(
        select(StripeWebhookEvent).where(StripeWebhookEvent.stripe_event_id == "evt_duplicate")
    )
    assert len(events.scalars().all()) == 1


@pytest.mark.asyncio
async def test_create_checkout_passes_stripe_best_practice_params(db_session: AsyncSession):
    sr, _quote = await _issued_quote(db_session)
    fake_session = SimpleNamespace(id="cs_test_bp", url="https://checkout.stripe.test/cs_test_bp")
    create_mock = AsyncMock(return_value=fake_session)

    with patch("services.quote_payments.initialize_stripe", new=AsyncMock()), patch(
        "services.quote_payments.stripe.checkout.Session.create_async",
        new=create_mock,
    ):
        service = QuotePaymentService(db_session)
        await service.create_checkout_session(sr.id, user_id=sr.user_id, customer_email="c@example.com")

    params = create_mock.await_args.kwargs
    assert params["invoice_creation"] == {"enabled": True}
    assert params["payment_intent_data"]["metadata"]["quote_id"]
    assert "payment_method_types" not in params
    assert params["expires_at"] > 0


@pytest.mark.asyncio
async def test_payment_config_endpoint():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/payments/config")
        assert resp.status_code == 200
        body = resp.json()
        assert body["payments_enabled"] is True
        assert body["webhook_configured"] is True
        assert body["checkout_ready"] is True
        assert body["mode"] == "test"
        assert body["currency"] == "SAR"


@pytest.mark.asyncio
async def test_payment_config_partial_when_webhook_missing(monkeypatch: pytest.MonkeyPatch):
    from core.config import settings

    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "")
    settings.__dict__.pop("stripe_webhook_secret", None)
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/payments/config")
        body = resp.json()
        assert body["payments_enabled"] is True
        assert body["webhook_configured"] is False
        assert body["checkout_ready"] is False


@pytest.mark.asyncio
async def test_checkout_api_requires_auth():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/v1/payments/service-requests/1/checkout")
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_payment_status_api_not_found_for_missing_quote():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/v1/payments/service-requests/99999/status",
            headers=auth_headers("unknown-user"),
        )
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_webhook_rejects_amount_mismatch(db_session: AsyncSession):
    sr, quote = await _issued_quote(db_session)
    payment = Payment(
        quote_id=quote.id,
        service_request_id=sr.id,
        user_id=sr.user_id,
        stripe_checkout_session_id="cs_test_mismatch",
        amount=quote.total_amount,
        currency="SAR",
        status=PAYMENT_STATUS_PENDING,
    )
    db_session.add(payment)
    await db_session.commit()

    payload_dict = {
        "id": "evt_mismatch",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_mismatch",
                "payment_status": "paid",
                "payment_intent": "pi_mismatch",
                "amount_total": 1,
                "currency": "sar",
            }
        },
    }
    payload = json.dumps(payload_dict).encode()

    with patch("services.quote_payments.stripe.Webhook.construct_event", return_value=payload_dict):
        service = QuotePaymentService(db_session)
        await service.handle_webhook_event(payload, "sig_test")
        await db_session.commit()

    await db_session.refresh(payment)
    assert payment.status == PAYMENT_STATUS_PENDING


@pytest.mark.asyncio
async def test_verify_checkout_session_marks_paid(db_session: AsyncSession):
    sr, quote = await _issued_quote(db_session)
    payment = Payment(
        quote_id=quote.id,
        service_request_id=sr.id,
        user_id=sr.user_id,
        stripe_checkout_session_id="cs_test_verify",
        amount=quote.total_amount,
        currency="SAR",
        status=PAYMENT_STATUS_PENDING,
    )
    db_session.add(payment)
    await db_session.commit()

    fake_session = SimpleNamespace(
        id="cs_test_verify",
        status="complete",
        payment_status="paid",
        payment_intent="pi_verify",
        amount_total=_amount_to_cents(quote.total_amount),
        currency="sar",
    )

    with patch("services.quote_payments.initialize_stripe", new=AsyncMock()), patch(
        "services.quote_payments.stripe.checkout.Session.retrieve_async",
        new=AsyncMock(return_value=fake_session),
    ), patch(
        "services.quote_payments.stripe.PaymentIntent.retrieve_async",
        new=AsyncMock(return_value=SimpleNamespace(latest_charge=None)),
    ):
        service = QuotePaymentService(db_session)
        result = await service.verify_checkout_session("cs_test_verify", user_id=sr.user_id)
        await db_session.commit()

    assert result["paid"] is True
    await db_session.refresh(payment)
    assert payment.status == PAYMENT_STATUS_COMPLETED


@pytest.mark.asyncio
async def test_webhook_marks_expired_and_failed(db_session: AsyncSession):
    sr, quote = await _issued_quote(db_session)
    for session_id, event_type, expected in (
        ("cs_test_fail", "checkout.session.async_payment_failed", PAYMENT_STATUS_FAILED),
        ("cs_test_exp", "checkout.session.expired", PAYMENT_STATUS_EXPIRED),
    ):
        payment = Payment(
            quote_id=quote.id,
            service_request_id=sr.id,
            user_id=sr.user_id,
            stripe_checkout_session_id=session_id,
            amount=quote.total_amount,
            currency="SAR",
            status=PAYMENT_STATUS_PENDING,
        )
        db_session.add(payment)
        await db_session.flush()

        payload_dict = {
            "id": f"evt_{session_id}",
            "type": event_type,
            "data": {"object": {"id": session_id}},
        }
        payload = json.dumps(payload_dict).encode()

        with patch("services.quote_payments.stripe.Webhook.construct_event", return_value=payload_dict):
            service = QuotePaymentService(db_session)
            await service.handle_webhook_event(payload, "sig_test")

        await db_session.refresh(payment)
        assert payment.status == expected


@pytest.mark.asyncio
async def test_webhook_rejects_invalid_signature(db_session: AsyncSession):
    import stripe

    payload = b"{}"
    with patch(
        "services.quote_payments.stripe.Webhook.construct_event",
        side_effect=stripe.error.SignatureVerificationError("bad sig", "sig"),
    ):
        service = QuotePaymentService(db_session)
        with pytest.raises(QuotePaymentError, match="Invalid webhook signature"):
            await service.handle_webhook_event(payload, "bad")
