"""Journey definition pinning at instance start (A012)."""

from __future__ import annotations

import copy

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.database import Base
from services.jos import PINNED_WORKFLOW_CONTEXT_KEY, JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition


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
                "description": "Test workflow pinning.",
                "workflow_definition": BUILD_VILLA_WORKFLOW,
            },
        )
        await session.commit()
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_start_pins_workflow_definition(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "pin-test-session"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    pinned = instance.context.get(PINNED_WORKFLOW_CONTEXT_KEY)
    assert isinstance(pinned, dict)
    assert pinned["initial_step"] == BUILD_VILLA_WORKFLOW["initial_step"]


@pytest.mark.asyncio
async def test_advance_uses_pinned_workflow_after_definition_mutation(db_session: AsyncSession):
    jos = JosService(db_session)
    session_id = "pin-advance-session"
    instance = await jos.start_journey("build_villa", anonymous_session_id=session_id)
    pinned = copy.deepcopy(instance.context[PINNED_WORKFLOW_CONTEXT_KEY])

    mutated = copy.deepcopy(BUILD_VILLA_WORKFLOW)
    mutated["initial_step"] = "city"
    mutated["steps"] = [step for step in mutated["steps"] if step["key"] != "project_intent"]
    definition = await jos.get_definition_by_type("build_villa")
    assert definition is not None
    definition.workflow_definition = mutated
    await db_session.commit()

    advanced = await jos.advance(
        instance.id,
        input_data={"project_objective": "فيلا عائلية"},
        anonymous_session_id=session_id,
    )
    assert advanced.current_step_key == "city"
    assert advanced.context[PINNED_WORKFLOW_CONTEXT_KEY]["initial_step"] == pinned["initial_step"]
