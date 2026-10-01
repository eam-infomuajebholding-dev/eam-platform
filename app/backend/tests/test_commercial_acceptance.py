"""Quote acceptance → contract + operational project."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from models.quotes import QUOTE_STATUS_ACCEPTED
from services.commercial_engagement import CommercialEngagementService
from tests.helpers.quote_flow import create_qualified_sr_with_user, issue_quote_for_sr


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
async def test_accept_issued_quote_creates_contract_and_op(db_session: AsyncSession):
    sr, user_id = await create_qualified_sr_with_user(db_session)
    await issue_quote_for_sr(db_session, sr.id)
    await db_session.commit()

    svc = CommercialEngagementService(db_session)
    result = await svc.accept_issued_quote(sr.id, user_id=user_id)
    await db_session.commit()

    assert result["quote"]["status"] == QUOTE_STATUS_ACCEPTED
    assert result["contract_reference"].startswith("CN-")
    assert result["operational_project_reference"].startswith("OP-")
