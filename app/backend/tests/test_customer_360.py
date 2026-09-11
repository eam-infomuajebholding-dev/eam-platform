"""Customer 360 read model tests."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from schemas.auth import UserResponse
from services.customer_360 import Customer360Service
from services.jos import JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from tests.helpers.build_villa_flow import advance_build_villa_v1_to_terminal


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


@pytest.mark.asyncio
async def test_customer_360_aggregates_service_requests_and_active_journeys(db_session: AsyncSession):
    user = UserResponse(id="c360-user", email="c360@example.com", name="Customer", role="user")
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    session_id = "c360-session"

    completed = await jos.start_journey(
        "build_villa",
        anonymous_session_id=f"{session_id}-completed",
        user_id=user.id,
    )
    completed = await advance_build_villa_v1_to_terminal(jos, completed.id, f"{session_id}-completed")
    await jos.complete(completed.id, anonymous_session_id=f"{session_id}-completed", user_id=user.id)
    assert await sr_service.get_by_journey_instance_id(completed.id) is not None

    active = await jos.start_journey(
        "build_villa",
        anonymous_session_id=session_id,
        user_id=user.id,
    )

    service = Customer360Service(db_session)
    view = await service.get_for_user(user)

    assert view.profile.id == user.id
    assert view.summary["service_request_count"] == 1
    assert view.summary["active_journey_count"] == 1
    assert view.active_journeys[0].id == active.id
