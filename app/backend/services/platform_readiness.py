"""Platform go-live readiness — no secrets, safe for ops dashboards."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Literal

from alembic.config import Config
from alembic.script import ScriptDirectory
from pathlib import Path

from services.payment_config import get_payment_config, is_checkout_ready

ReadinessState = Literal["READY", "DEGRADED", "BLOCKED"]

EXPECTED_ALEMBIC_HEAD = "c0d1e2f4a5b6"


def _env_present(name: str) -> bool:
    return bool(os.environ.get(name, "").strip())


def _jwt_usable() -> bool:
    key = os.environ.get("JWT_SECRET_KEY", "")
    if not key.strip():
        return False
    if key.strip().lower() in {"change-me", "changeme", "secret"}:
        return False
    return True


def _oidc_ready() -> bool:
    return _env_present("OIDC_ISSUER_URL") and _env_present("OIDC_CLIENT_ID") and _env_present(
        "OIDC_CLIENT_SECRET"
    )


def _alembic_head_ok() -> tuple[bool, str | None]:
    try:
        backend_root = Path(__file__).resolve().parents[1]
        cfg = Config(str(backend_root / "alembic.ini"))
        script = ScriptDirectory.from_config(cfg)
        heads = script.get_heads()
        if len(heads) != 1:
            return False, ",".join(heads) if heads else "none"
        return heads[0] == EXPECTED_ALEMBIC_HEAD, heads[0]
    except Exception:
        return False, None


def get_platform_readiness() -> dict:
    payment = get_payment_config()
    alembic_ok, alembic_head = _alembic_head_ok()
    jwt_ok = _jwt_usable()
    oidc_ok = _oidc_ready()
    frontend_ok = _env_present("FRONTEND_URL") or _env_present("LOCAL_PATCH")

    # Credential-free journeys + ops JWT work without OIDC
    core_operational = jwt_ok and alembic_ok and _env_present("DATABASE_URL")

    blockers: list[dict[str, str]] = []
    if not jwt_ok:
        blockers.append(
            {
                "id": "jwt_secret",
                "label_ar": "JWT_SECRET_KEY",
                "detail_ar": "عيّن مفتاحاً قوياً في app/.env — مطلوب للتشغيل والاختبارات",
            }
        )
    if not _env_present("DATABASE_URL"):
        blockers.append(
            {
                "id": "database_url",
                "label_ar": "DATABASE_URL",
                "detail_ar": "رابط قاعدة البيانات مطلوب",
            }
        )
    if not alembic_ok:
        blockers.append(
            {
                "id": "alembic_head",
                "label_ar": "ترحيل Alembic",
                "detail_ar": f"شغّل: alembic upgrade head (المتوقع {EXPECTED_ALEMBIC_HEAD}, الحالي {alembic_head})",
            }
        )

    pending_external: list[dict[str, str]] = []
    if not oidc_ok:
        pending_external.append(
            {
                "id": "oidc",
                "label_ar": "OIDC (IdP)",
                "detail_ar": "OIDC_ISSUER_URL + OIDC_CLIENT_ID + OIDC_CLIENT_SECRET — للدخول الإنتاجي",
                "env_keys": "OIDC_ISSUER_URL,OIDC_CLIENT_ID,OIDC_CLIENT_SECRET,OIDC_SCOPE",
            }
        )
    if not payment.get("checkout_ready"):
        pending_external.append(
            {
                "id": "stripe_checkout",
                "label_ar": "Stripe Checkout + Webhook",
                "detail_ar": "STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET + FRONTEND_URL — للدفع بعد إصدار العرض",
                "env_keys": "STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET,FRONTEND_URL",
            }
        )

    pending_business: list[dict[str, str]] = [
        {
            "id": "quote_acceptance",
            "label_ar": "قبول عرض السعر",
            "detail_ar": "قرار مالك — راجع docs/commercial/QUOTE_ACCEPTANCE_OWNER_DECISION_PACK.md",
        },
        {
            "id": "investment_journey",
            "label_ar": "رحلة الاستثمار (#03)",
            "detail_ar": "BLOCKED_UPSTREAM — Opportunity BO (مستثنى حتى قرار منتج)",
        },
    ]

    if core_operational and not blockers:
        overall: ReadinessState = "READY" if oidc_ok and payment.get("checkout_ready") else "DEGRADED"
    else:
        overall = "BLOCKED"

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "overall": overall,
        "core_operational": core_operational,
        "credential_free_journeys": core_operational,
        "live_journey_count": 13,
        "alembic": {
            "expected_head": EXPECTED_ALEMBIC_HEAD,
            "current_head": alembic_head,
            "aligned": alembic_ok,
        },
        "auth": {
            "jwt_configured": jwt_ok,
            "oidc_configured": oidc_ok,
            "pkce_ready": True,
        },
        "payments": payment,
        "frontend_url_configured": frontend_ok,
        "blockers": blockers,
        "pending_external": pending_external,
        "pending_business": pending_business,
        "next_commands": [
            "cd app/backend && python -m alembic upgrade head",
            "cd app/backend && python scripts/verify_platform_readiness.py",
            "cd app/frontend && pnpm run build",
        ],
    }
