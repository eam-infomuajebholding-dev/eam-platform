"""Partner registry and journey attribution."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from models.partners import PARTNER_STATUS_ACTIVE
from services.jos import JosService
from services.jos_seed import BUILDING_MATERIALS_WORKFLOW, upsert_journey_definition
from services.partner_attribution import enrich_journey_initial_context
from services.partners import PartnerService
from services.building_materials_validators import BUILDING_MATERIALS_JOURNEY_TYPE


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
                "journey_type": BUILDING_MATERIALS_JOURNEY_TYPE,
                "name": "Building Materials",
                "description": "Test",
                "workflow_definition": BUILDING_MATERIALS_WORKFLOW,
            },
        )
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_enrich_partner_context(db_session: AsyncSession):
    partners = PartnerService(db_session)
    org = await partners.create_organization(
        {
            "slug": "demo-supplier",
            "legal_name": "Demo Supplier LLC",
            "display_name_ar": "مورد تجريبي",
            "status": PARTNER_STATUS_ACTIVE,
            "journey_types": [BUILDING_MATERIALS_JOURNEY_TYPE],
            "sector_slugs": ["building-materials"],
        }
    )
    await partners.create_outlet(
        org.id,
        {"outlet_code": "jed-01", "name_ar": "فرع جدة", "city": "جدة"},
    )
    await db_session.commit()

    context = await enrich_journey_initial_context(
        db_session,
        journey_type=BUILDING_MATERIALS_JOURNEY_TYPE,
        initial_context={"partner": "demo-supplier", "outlet": "jed-01"},
    )
    assert context["partner_org_id"] == org.id
    assert context["partner_outlet_code"] == "jed-01"
    assert context["source_channel"] == "partner:demo-supplier:jed-01"


@pytest.mark.asyncio
async def test_start_journey_with_partner(db_session: AsyncSession):
    partners = PartnerService(db_session)
    await partners.create_organization(
        {
            "slug": "acme",
            "legal_name": "ACME",
            "display_name_ar": "أكمي",
            "status": PARTNER_STATUS_ACTIVE,
            "journey_types": [BUILDING_MATERIALS_JOURNEY_TYPE],
            "sector_slugs": ["building-materials"],
        }
    )
    await db_session.commit()

    jos = JosService(db_session)
    instance = await jos.start_journey(
        BUILDING_MATERIALS_JOURNEY_TYPE,
        anonymous_session_id="partner-anon",
        initial_context={"partner_slug": "acme"},
    )
    assert instance.context.get("partner_slug") == "acme"
    assert instance.context.get("source_channel") == "partner:acme"
