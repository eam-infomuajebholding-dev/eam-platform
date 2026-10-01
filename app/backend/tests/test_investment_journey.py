"""Investment journey (#03) smoke tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.investment_validators import INVESTMENT_JOURNEY_TYPE, assemble_investment_interest_brief
from services.jos import JosService
from services.jos_seed import INVESTMENT_WORKFLOW, upsert_journey_definition


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
                "journey_type": INVESTMENT_JOURNEY_TYPE,
                "name": "Investment",
                "description": "Test",
                "workflow_definition": INVESTMENT_WORKFLOW,
            },
        )
        await session.commit()
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_investment_starts_at_investor_profile(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey(INVESTMENT_JOURNEY_TYPE, anonymous_session_id="iv-anon-1")
    assert instance.current_step_key == "investor_profile"


def test_investment_brief_has_no_roi_promise():
    brief = assemble_investment_interest_brief({"interest_focus": "joint_venture"})
    text = " ".join(brief.get("preliminary_considerations", []))
    assert "عائد" in text or "return" in text.lower() or brief["status"] == "PRELIMINARY"
