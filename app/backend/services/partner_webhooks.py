"""Signed outbound webhooks for partner integrations (Stripe-style HMAC)."""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import logging
import secrets
import time
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.partner_platform import PartnerWebhookDelivery, PartnerWebhookSubscription

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT_SECONDS = 8.0
MAX_DELIVERY_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = (0.4, 1.0, 2.0)


def generate_webhook_secret() -> str:
    return f"whsec_{secrets.token_urlsafe(32)}"


def sign_payload(secret: str, timestamp: int, body: bytes) -> str:
    signed = hmac.new(secret.encode("utf-8"), f"{timestamp}.".encode() + body, hashlib.sha256).hexdigest()
    return signed


async def _post_webhook(
    client: httpx.AsyncClient,
    *,
    url: str,
    body: bytes,
    event_type: str,
    timestamp: int,
    signature: str,
) -> tuple[int | None, str | None]:
    try:
        response = await client.post(
            url,
            content=body,
            headers={
                "Content-Type": "application/json",
                "X-EAM-Event": event_type,
                "X-EAM-Timestamp": str(timestamp),
                "X-EAM-Signature": signature,
                "User-Agent": "EAM-Partner-Webhooks/1.0",
            },
        )
        if 200 <= response.status_code < 300:
            return response.status_code, None
        return response.status_code, (response.text or "")[:500]
    except Exception as exc:
        return None, str(exc)[:500]


async def dispatch_partner_webhooks(
    db: AsyncSession,
    *,
    partner_org_id: int,
    event_type: str,
    payload: dict[str, Any],
) -> None:
    result = await db.execute(
        select(PartnerWebhookSubscription).where(
            PartnerWebhookSubscription.partner_org_id == partner_org_id,
            PartnerWebhookSubscription.is_active.is_(True),
        )
    )
    subscriptions = list(result.scalars().all())
    if not subscriptions:
        return

    body = json.dumps(
        {"id": f"evt_{secrets.token_hex(8)}", "type": event_type, "data": payload},
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")
    timestamp = int(time.time())

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT_SECONDS) as client:
        for sub in subscriptions:
            events = sub.event_types or []
            if events and event_type not in events:
                continue
            signature = sign_payload(sub.secret, timestamp, body)
            delivery = PartnerWebhookDelivery(
                subscription_id=sub.id,
                event_type=event_type,
                payload_json=json.loads(body.decode("utf-8")),
                success=False,
            )
            last_error: str | None = None
            response_status: int | None = None
            for attempt, delay in enumerate(RETRY_BACKOFF_SECONDS[:MAX_DELIVERY_ATTEMPTS]):
                if attempt > 0:
                    await asyncio.sleep(delay)
                response_status, last_error = await _post_webhook(
                    client,
                    url=sub.url,
                    body=body,
                    event_type=event_type,
                    timestamp=timestamp,
                    signature=signature,
                )
                if last_error is None and response_status is not None:
                    delivery.success = True
                    delivery.response_status = response_status
                    break
            if not delivery.success:
                delivery.response_status = response_status
                delivery.error_message = last_error
                if delivery.error_message:
                    delivery.error_message = f"{delivery.error_message} (attempts={MAX_DELIVERY_ATTEMPTS})"[:500]
                logger.warning(
                    "Webhook delivery failed sub=%s event=%s status=%s",
                    sub.id,
                    event_type,
                    response_status,
                )
            db.add(delivery)
    await db.flush()
