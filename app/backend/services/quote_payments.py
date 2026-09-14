"""Stripe Checkout for issued customer quotes (hosted flow, SAR)."""

from __future__ import annotations

import logging
import secrets
from datetime import datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal

import stripe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models.payments import (
    PAYMENT_STATUS_COMPLETED,
    PAYMENT_STATUS_EXPIRED,
    PAYMENT_STATUS_FAILED,
    PAYMENT_STATUS_PENDING,
    Payment,
)
from models.stripe_webhook_events import StripeWebhookEvent
from models.quotes import QUOTE_CUSTOMER_VISIBLE_STATUSES, QUOTE_STATUS_ISSUED, QUOTE_STATUS_PAID, Quote
from services.payment import CheckoutError, initialize_stripe
from services.payment_config import is_stripe_configured, is_stripe_webhook_configured
from services.quotes import QuoteService, QuoteTransitionError, QuoteValidationError
from services.service_requests import ServiceRequestService

logger = logging.getLogger(__name__)

TWOPLACES = Decimal("0.01")


class QuotePaymentError(ValueError):
    """Quote payment business rule violation."""


def _resolve_frontend_base_url() -> str:
    for attr in ("frontend_url", "vite_frontend_url"):
        try:
            value = getattr(settings, attr)
            if value:
                return str(value).rstrip("/")
        except AttributeError:
            continue
    return "http://localhost:3000"


def _resolve_checkout_urls(service_request_id: int) -> tuple[str, str]:
    base = _resolve_frontend_base_url()
    try:
        success = settings.stripe_success_url
    except AttributeError:
        success = f"{base}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    try:
        cancel = settings.stripe_cancel_url
    except AttributeError:
        cancel = f"{base}/payment/cancel?request_id={service_request_id}"
    if "{CHECKOUT_SESSION_ID}" not in success:
        separator = "&" if "?" in success else "?"
        success = f"{success}{separator}session_id={{CHECKOUT_SESSION_ID}}"
    return success, cancel


def _amount_to_cents(amount: Decimal) -> int:
    return int((amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def _line_total(quantity: Decimal, unit_price: Decimal) -> Decimal:
    return (quantity * unit_price).quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def _build_quote_line_items(quote: Quote) -> list[dict]:
    currency = quote.currency.lower()
    items: list[dict] = []
    for line_item in quote.line_items:
        items.append(
            {
                "price_data": {
                    "currency": currency,
                    "product_data": {"name": line_item.description[:500]},
                    "unit_amount": _amount_to_cents(_line_total(line_item.quantity, line_item.unit_price)),
                },
                "quantity": 1,
            }
        )
    if quote.vat_amount > 0:
        items.append(
            {
                "price_data": {
                    "currency": currency,
                    "product_data": {"name": "ضريبة القيمة المضافة (15%)"},
                    "unit_amount": _amount_to_cents(quote.vat_amount),
                },
                "quantity": 1,
            }
        )
    return items


class QuotePaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.quote_service = QuoteService(db)

    async def get_payment_status(self, service_request_id: int, *, user_id: str) -> dict:
        quote = await self.quote_service.get_customer_issued_quote(service_request_id, user_id=user_id)
        if quote is None:
            raise QuotePaymentError("Issued quote not found")
        return await self._payment_status_for_quote(quote, service_request_id)

    async def get_ops_payment_status(self, service_request_id: int) -> dict:
        quote = await self.quote_service.get_by_service_request_id(service_request_id)
        if quote is None or quote.status not in QUOTE_CUSTOMER_VISIBLE_STATUSES:
            raise QuotePaymentError("Issued quote not found")
        return await self._payment_status_for_quote(quote, service_request_id)

    async def _payment_status_for_quote(self, quote: Quote, service_request_id: int) -> dict:
        payment = await self._get_latest_payment_for_quote(quote.id)
        now = datetime.now(timezone.utc)
        expired = quote.valid_until is not None and quote.valid_until < now
        paid = quote.status == QUOTE_STATUS_PAID or (
            payment is not None and payment.status == PAYMENT_STATUS_COMPLETED
        )
        stripe_ready = is_stripe_configured()
        can_pay = (
            stripe_ready
            and quote.status == QUOTE_STATUS_ISSUED
            and not paid
            and not expired
            and quote.total_amount > 0
        )

        return {
            "quote_id": quote.id,
            "service_request_id": service_request_id,
            "status": payment.status if payment else ("completed" if paid else "none"),
            "paid": paid,
            "amount": quote.total_amount,
            "currency": quote.currency,
            "paid_at": payment.paid_at if payment and payment.status == PAYMENT_STATUS_COMPLETED else None,
            "can_pay": can_pay,
            "quote_status": quote.status,
            "payments_enabled": stripe_ready,
            "webhook_configured": is_stripe_webhook_configured(),
            "receipt_url": payment.stripe_receipt_url if payment and paid else None,
        }

    async def create_checkout_session(
        self,
        service_request_id: int,
        *,
        user_id: str,
        customer_email: str | None = None,
    ) -> dict:
        quote = await self.quote_service.get_customer_issued_quote(service_request_id, user_id=user_id)
        if quote is None:
            raise QuotePaymentError("Issued quote not found")
        if quote.status != QUOTE_STATUS_ISSUED:
            raise QuotePaymentError("Quote is not available for payment")
        if not quote.line_items:
            raise QuotePaymentError("Quote has no billable line items")

        now = datetime.now(timezone.utc)
        if quote.valid_until is not None and quote.valid_until < now:
            raise QuotePaymentError("Quote has expired")

        existing = await self._get_open_checkout_for_quote(quote.id)
        if existing and existing.url:
            return {"session_id": existing.session_id, "url": existing.url}

        completed = await self._get_completed_payment_for_quote(quote.id)
        if completed is not None:
            raise QuotePaymentError("Quote has already been paid")

        try:
            stripe_key = settings.stripe_secret_key
        except AttributeError as exc:
            raise QuotePaymentError("Online payments are not configured") from exc
        if not stripe_key:
            raise QuotePaymentError("Online payments are not configured")

        success_url, cancel_url = _resolve_checkout_urls(service_request_id)
        metadata = {
            "quote_id": str(quote.id),
            "service_request_id": str(service_request_id),
            "user_id": user_id,
            "reference_code": quote.reference_code,
        }

        await initialize_stripe()

        session_expiry = _checkout_session_expires_at(now, quote.valid_until)
        params: dict = {
            "mode": "payment",
            "line_items": _build_quote_line_items(quote),
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": metadata,
            "payment_intent_data": {"metadata": metadata},
            "locale": "auto",
            "client_reference_id": quote.reference_code,
            "customer_creation": "if_required",
            "invoice_creation": _invoice_creation_params(),
            "expires_at": session_expiry,
        }
        if customer_email:
            params["customer_email"] = customer_email

        # Per-attempt key — avoids Stripe idempotency blocking re-checkout after expiry.
        attempt = await self._count_payments_for_quote(quote.id)
        idempotency_key = f"quote-{quote.id}-attempt-{attempt + 1}-{secrets.token_hex(4)}"
        try:
            session = await stripe.checkout.Session.create_async(
                **params,
                idempotency_key=idempotency_key,
            )
        except stripe.error.StripeError as exc:
            raise CheckoutError(f"Failed to create checkout session: {exc}") from exc

        if not session.url:
            raise CheckoutError("Stripe did not return a checkout URL")

        payment = Payment(
            quote_id=quote.id,
            service_request_id=service_request_id,
            user_id=user_id,
            stripe_checkout_session_id=session.id,
            amount=quote.total_amount,
            currency=quote.currency,
            status=PAYMENT_STATUS_PENDING,
        )
        self.db.add(payment)
        await self.db.flush()

        return {"session_id": session.id, "url": session.url}

    async def verify_checkout_session(self, session_id: str, *, user_id: str) -> dict:
        payment = await self._get_payment_by_session_id(session_id)
        if payment is None:
            raise QuotePaymentError("Checkout session not found")
        if payment.user_id != user_id:
            raise QuotePaymentError("Checkout session not found")

        await initialize_stripe()
        session = await stripe.checkout.Session.retrieve_async(session_id)

        paid = _session_is_paid(session) or payment.status == PAYMENT_STATUS_COMPLETED
        if _session_is_paid(session) and payment.status != PAYMENT_STATUS_COMPLETED:
            if not _session_amount_matches_payment(session, payment):
                logger.error(
                    "Checkout verify amount mismatch for session %s (quote %s)",
                    session_id,
                    payment.quote_id,
                )
            else:
                await self._complete_payment(payment, payment_intent_id=session.payment_intent)
                paid = True

        return {
            "session_id": session.id,
            "status": session.status or "unknown",
            "payment_status": session.payment_status or "unknown",
            "paid": paid,
            "quote_id": payment.quote_id,
            "service_request_id": payment.service_request_id,
            "amount_total": session.amount_total or 0,
            "currency": (session.currency or payment.currency).upper(),
            "receipt_url": payment.stripe_receipt_url,
        }

    async def handle_webhook_event(self, payload: bytes, signature: str | None) -> None:
        try:
            webhook_secret = settings.stripe_webhook_secret
        except AttributeError as exc:
            raise QuotePaymentError("Stripe webhook is not configured") from exc

        if not webhook_secret:
            raise QuotePaymentError("Stripe webhook is not configured")
        if not signature:
            raise QuotePaymentError("Missing Stripe signature")

        try:
            event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
        except ValueError as exc:
            raise QuotePaymentError("Invalid webhook payload") from exc
        except stripe.error.SignatureVerificationError as exc:
            raise QuotePaymentError("Invalid webhook signature") from exc

        event_id = event.get("id")
        event_type = event["type"]
        if event_id and await self._webhook_already_processed(event_id):
            logger.debug("Skipping duplicate Stripe webhook %s", event_id)
            return

        data_object = event["data"]["object"]

        if event_type in {"checkout.session.completed", "checkout.session.async_payment_succeeded"}:
            await self._handle_checkout_session_paid(data_object)
        elif event_type == "checkout.session.async_payment_failed":
            await self._handle_checkout_session_failed(data_object)
        elif event_type == "checkout.session.expired":
            await self._handle_checkout_session_expired(data_object)
        elif event_type in {"charge.refunded", "charge.dispute.created"}:
            await self._handle_charge_lifecycle_event(event_type, data_object)
        else:
            logger.debug("Ignoring unhandled Stripe webhook event type: %s", event_type)

        if event_id:
            await self._mark_webhook_processed(event_id, event_type)

    async def _handle_checkout_session_paid(self, data_object: dict) -> None:
        session_id = data_object.get("id")
        if not session_id:
            return
        payment = await self._get_payment_by_session_id(session_id)
        if payment is None:
            logger.warning("Webhook for unknown checkout session %s", session_id)
            return
        if data_object.get("payment_status") != "paid":
            return
        if not _session_amount_matches_payment(data_object, payment):
            logger.error(
                "Webhook amount mismatch for session %s (quote %s) — payment not completed",
                session_id,
                payment.quote_id,
            )
            return
        await self._complete_payment(payment, payment_intent_id=data_object.get("payment_intent"))

    async def _handle_checkout_session_failed(self, data_object: dict) -> None:
        session_id = data_object.get("id")
        if not session_id:
            return
        payment = await self._get_payment_by_session_id(session_id)
        if payment is None or payment.status != PAYMENT_STATUS_PENDING:
            return
        payment.status = PAYMENT_STATUS_FAILED
        payment.updated_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def _handle_checkout_session_expired(self, data_object: dict) -> None:
        session_id = data_object.get("id")
        if not session_id:
            return
        payment = await self._get_payment_by_session_id(session_id)
        if payment is None or payment.status != PAYMENT_STATUS_PENDING:
            return
        payment.status = PAYMENT_STATUS_EXPIRED
        payment.updated_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def _handle_charge_lifecycle_event(self, event_type: str, data_object: dict) -> None:
        """Log refunds/disputes for ops follow-up — full reversal flow is post-M1."""
        logger.info(
            "Stripe %s received charge=%s payment_intent=%s amount=%s",
            event_type,
            data_object.get("id"),
            data_object.get("payment_intent"),
            data_object.get("amount"),
        )

    async def _complete_payment(self, payment: Payment, *, payment_intent_id: str | None) -> None:
        if payment.status == PAYMENT_STATUS_COMPLETED:
            return

        now = datetime.now(timezone.utc)
        payment.status = PAYMENT_STATUS_COMPLETED
        payment.paid_at = now
        payment.updated_at = now
        if payment_intent_id:
            payment.stripe_payment_intent_id = str(payment_intent_id)
            try:
                receipt_url = await self._fetch_receipt_url(str(payment_intent_id))
                if receipt_url:
                    payment.stripe_receipt_url = receipt_url
            except Exception:
                logger.warning(
                    "Receipt URL unavailable for payment intent %s",
                    payment_intent_id,
                    exc_info=True,
                )

        quote = None
        try:
            quote = await self.quote_service.mark_paid(payment.quote_id)
        except (QuoteValidationError, QuoteTransitionError):
            quote = await self.quote_service.get_by_id(payment.quote_id)
            if quote is None or quote.status != QUOTE_STATUS_PAID:
                raise

        if quote is None:
            quote = await self.quote_service.get_by_id(payment.quote_id)

        try:
            await ServiceRequestService(self.db).record_payment_received(
                payment.service_request_id,
                user_id=payment.user_id,
                payment_id=payment.id,
                amount=payment.amount,
                currency=payment.currency,
                quote_reference=quote.reference_code if quote else "",
            )
        except Exception:
            logger.exception(
                "Failed to record payment activity for service request %s",
                payment.service_request_id,
            )

        await self.db.flush()

    async def _fetch_receipt_url(self, payment_intent_id: str) -> str | None:
        if not stripe.api_key:
            try:
                await initialize_stripe()
            except CheckoutError:
                return None
        try:
            intent = await stripe.PaymentIntent.retrieve_async(
                payment_intent_id,
                expand=["latest_charge"],
            )
            charge = intent.latest_charge
            if charge is not None and getattr(charge, "receipt_url", None):
                return str(charge.receipt_url)
        except stripe.error.StripeError as exc:
            logger.warning("Could not fetch receipt for %s: %s", payment_intent_id, exc)
        return None

    async def _webhook_already_processed(self, event_id: str) -> bool:
        result = await self.db.execute(
            select(StripeWebhookEvent.id).where(StripeWebhookEvent.stripe_event_id == event_id).limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def _mark_webhook_processed(self, event_id: str, event_type: str) -> None:
        self.db.add(
            StripeWebhookEvent(
                stripe_event_id=event_id,
                event_type=event_type,
            )
        )
        await self.db.flush()

    async def _count_payments_for_quote(self, quote_id: int) -> int:
        result = await self.db.execute(select(Payment.id).where(Payment.quote_id == quote_id))
        return len(result.all())

    async def _get_payment_by_session_id(self, session_id: str) -> Payment | None:
        result = await self.db.execute(
            select(Payment).where(Payment.stripe_checkout_session_id == session_id).limit(1)
        )
        return result.scalar_one_or_none()

    async def _get_latest_payment_for_quote(self, quote_id: int) -> Payment | None:
        result = await self.db.execute(
            select(Payment).where(Payment.quote_id == quote_id).order_by(Payment.created_at.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def _get_completed_payment_for_quote(self, quote_id: int) -> Payment | None:
        result = await self.db.execute(
            select(Payment)
            .where(Payment.quote_id == quote_id, Payment.status == PAYMENT_STATUS_COMPLETED)
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def _get_open_checkout_for_quote(self, quote_id: int) -> _OpenCheckout | None:
        payment = await self._get_latest_payment_for_quote(quote_id)
        if payment is None or payment.status != PAYMENT_STATUS_PENDING:
            return None

        await initialize_stripe()
        try:
            session = await stripe.checkout.Session.retrieve_async(payment.stripe_checkout_session_id)
        except stripe.error.StripeError:
            return None

        if session.status == "open" and session.url:
            return _OpenCheckout(session_id=session.id, url=session.url)

        if session.status == "complete" and session.payment_status == "paid":
            if _session_amount_matches_payment(session, payment):
                await self._complete_payment(payment, payment_intent_id=session.payment_intent)
            else:
                logger.error(
                    "Open checkout reconcile amount mismatch for session %s (quote %s)",
                    payment.stripe_checkout_session_id,
                    payment.quote_id,
                )

        if session.status == "expired" and payment.status == PAYMENT_STATUS_PENDING:
            payment.status = PAYMENT_STATUS_EXPIRED
            payment.updated_at = datetime.now(timezone.utc)
            await self.db.flush()

        return None


class _OpenCheckout:
    def __init__(self, *, session_id: str, url: str):
        self.session_id = session_id
        self.url = url


def _checkout_session_expires_at(now: datetime, quote_valid_until: datetime | None) -> int:
    """Stripe Checkout expires_at — min 30 minutes, max 24 hours from now."""
    min_expiry = now + timedelta(minutes=30)
    max_expiry = now + timedelta(hours=24)
    if quote_valid_until is not None:
        target = min(quote_valid_until, max_expiry)
    else:
        target = max_expiry
    return int(max(min_expiry, target).timestamp())


def _session_is_paid(session) -> bool:
    return getattr(session, "payment_status", None) == "paid"


def _session_amount_matches_payment(session_or_dict, payment: Payment) -> bool:
    """Verify Stripe session totals match our persisted quote payment (anti-tamper)."""
    if isinstance(session_or_dict, dict):
        amount_total = session_or_dict.get("amount_total")
        currency = session_or_dict.get("currency")
    else:
        amount_total = getattr(session_or_dict, "amount_total", None)
        currency = getattr(session_or_dict, "currency", None)

    if amount_total is None:
        logger.warning("Stripe session missing amount_total for payment %s", payment.id)
        return False

    expected_cents = _amount_to_cents(Decimal(str(payment.amount)))
    if int(amount_total) != expected_cents:
        logger.error(
            "Amount mismatch payment=%s expected_cents=%s stripe_cents=%s",
            payment.id,
            expected_cents,
            amount_total,
        )
        return False

    stripe_currency = (currency or payment.currency).upper()
    if stripe_currency != payment.currency.upper():
        logger.error(
            "Currency mismatch payment=%s expected=%s stripe=%s",
            payment.id,
            payment.currency,
            stripe_currency,
        )
        return False

    return True


def _invoice_creation_params() -> dict:
    invoice: dict = {"enabled": True}
    try:
        footer = settings.stripe_invoice_footer
    except AttributeError:
        footer = None
    if footer:
        invoice["invoice_data"] = {"footer": str(footer)[:500]}
    return invoice
