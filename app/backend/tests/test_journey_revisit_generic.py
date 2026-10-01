"""Generic step revisit across journey types."""

from __future__ import annotations

import os

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.building_materials_validators import BUILDING_MATERIALS_JOURNEY_TYPE
from services.jos import JosService
from services.jos_seed import BUILDING_MATERIALS_WORKFLOW, upsert_journey_definition
from tests.helpers.building_materials_flow import advance_building_materials_v2_to_terminal


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
                "name": "Building Materials Intake",
                "description": "Test",
                "workflow_definition": BUILDING_MATERIALS_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_building_materials_revisit_delivery_location(db_session: AsyncSession):
    os.environ["JOURNEY_DEV_OTP"] = "123456"
    jos = JosService(db_session)
    session_id = "bm-revisit-1"
    instance = await jos.start_journey(
        BUILDING_MATERIALS_JOURNEY_TYPE,
        anonymous_session_id=session_id,
    )
    await advance_building_materials_v2_to_terminal(jos, instance.id, session_id)
    instance = await jos.get_instance(instance.id)
    assert instance is not None
    assert instance.current_step_key == "intake_complete"
    assert instance.context.get("procurement_invoice")

    await jos.revisit_step(instance.id, "delivery_location", anonymous_session_id=session_id)
    instance = await jos.get_instance(instance.id)
    assert instance.current_step_key == "delivery_location"
    assert instance.context.get("procurement_invoice") is None
