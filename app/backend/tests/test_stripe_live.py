"""Live Stripe test-mode checks — skipped unless STRIPE_SECRET_KEY is a real test key."""

from __future__ import annotations

import os

import pytest
import stripe

from services.payment import initialize_stripe


def _live_stripe_configured() -> bool:
    key = os.environ.get("STRIPE_SECRET_KEY", "").strip()
    return bool(key) and key.startswith("sk_test_") and "..." not in key and len(key) >= 24


@pytest.mark.asyncio
@pytest.mark.skipif(not _live_stripe_configured(), reason="STRIPE_SECRET_KEY not set to real sk_test_ key")
async def test_stripe_account_connects():
    await initialize_stripe()
    account = await stripe.Account.retrieve_async()
    assert account.id


def test_live_stripe_skips_without_real_key():
    assert not _live_stripe_configured()


def test_live_stripe_skips_with_placeholder(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_fake")
    assert not _live_stripe_configured()


@pytest.mark.asyncio
@pytest.mark.skipif(not _live_stripe_configured(), reason="STRIPE_SECRET_KEY not set to real sk_test_ key")
async def test_stripe_can_create_checkout_session():
    await initialize_stripe()
    session = await stripe.checkout.Session.create_async(
        mode="payment",
        line_items=[
            {
                "price_data": {
                    "currency": "sar",
                    "product_data": {"name": "EAM connectivity test"},
                    "unit_amount": 11500,
                },
                "quantity": 1,
            }
        ],
        success_url="http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="http://localhost:3000/payment/cancel",
        metadata={"test": "connectivity"},
    )
    assert session.id.startswith("cs_")
    assert session.url
