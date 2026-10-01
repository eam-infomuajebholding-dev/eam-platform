"""Partner platform — API keys, assignment, webhooks."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
import models.partners  # noqa: F401 — register ORM tables
import models.partner_platform  # noqa: F401
from models.partners import PARTNER_STATUS_ACTIVE
from services.partner_api_keys import PartnerApiKeyService
from services.partner_webhooks import sign_payload
from services.partners import PartnerService


@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_webhook_delivery_retries_until_success(monkeypatch: pytest.MonkeyPatch):
    import services.partner_webhooks as wh

    call_count = 0

    async def flaky_post(*_args, **_kwargs):
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            return None, "timeout"
        return 200, None

    monkeypatch.setattr(wh, "_post_webhook", flaky_post)
    monkeypatch.setattr(wh, "RETRY_BACKOFF_SECONDS", (0, 0, 0))

    subscription = type(
        "Sub",
        (),
        {"id": 1, "url": "https://example.com/hook", "secret": "whsec_test", "event_types": []},
    )()

    class FakeDb:
        async def execute(self, _query):
            return type("R", (), {"scalars": lambda self: type("S", (), {"all": lambda self: [subscription]})()})()

        def add(self, _obj):
            pass

        async def flush(self):
            pass

    class FakeClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

    monkeypatch.setattr(wh.httpx, "AsyncClient", lambda *a, **k: FakeClient())

    await wh.dispatch_partner_webhooks(
        FakeDb(),
        partner_org_id=1,
        event_type="service_request.created",
        payload={"id": 1},
    )
    assert call_count == 3


def test_webhook_signature_deterministic():
    body = b'{"type":"test"}'
    sig = sign_payload("whsec_test", 1234567890, body)
    assert sig == sign_payload("whsec_test", 1234567890, body)
    assert sig != sign_payload("whsec_other", 1234567890, body)


@pytest.mark.asyncio
async def test_api_key_authenticate(db_session: AsyncSession):
    partners = PartnerService(db_session)
    org = await partners.create_organization(
        {
            "slug": "key-co",
            "legal_name": "Key Co",
            "display_name_ar": "شركة",
            "status": PARTNER_STATUS_ACTIVE,
            "journey_types": [],
            "sector_slugs": [],
        }
    )
    await db_session.commit()

    keys = PartnerApiKeyService(db_session)
    _cred, full = await keys.create_credential(
        partner_org_id=org.id,
        name="ERP",
        scopes=["orders:read"],
        created_by_user_id=None,
    )
    await db_session.commit()

    authed = await keys.authenticate(full)
    assert authed is not None
    assert authed.partner_org_id == org.id
