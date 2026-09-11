"""Runtime Tool Gateway integration tests (WO-008 STREAM B)."""

from __future__ import annotations

import os
import uuid

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.auth import create_access_token
from core.database import Base
from services.ai.tool_gateway import ToolExecutionContext, ToolGateway
from services.jos import JosService
from services.jos_seed import BUILD_VILLA_WORKFLOW, upsert_journey_definition
from services.service_requests import ServiceRequestService
from tests.helpers.build_villa_flow import advance_build_villa_v1_to_terminal


@pytest.fixture(autouse=True)
def jwt_secret_env(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("JWT_SECRET_KEY", os.environ.get("JWT_SECRET_KEY", "test-jwt-secret"))


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


def _ctx(**kwargs) -> ToolExecutionContext:
    defaults = {
        "trace_id": str(uuid.uuid4()),
        "anonymous_session_id": "anon-tool-1",
        "granted_permissions": {"journey.start", "journey.resume", "journey.read"},
        "confirmation_present": False,
    }
    defaults.update(kwargs)
    return ToolExecutionContext(**defaults)


@pytest.mark.asyncio
async def test_journey_start_requires_confirmation(db_session: AsyncSession):
    gateway = ToolGateway(db_session)
    denied = await gateway.execute(
        "journey.start",
        {"journey_type": "build_villa"},
        _ctx(confirmation_present=False),
    )
    assert denied.status == "denied"
    assert denied.error_code == "CONFIRMATION_MISSING"


@pytest.mark.asyncio
async def test_journey_start_success(db_session: AsyncSession):
    gateway = ToolGateway(db_session)
    result = await gateway.execute(
        "journey.start",
        {"journey_type": "build_villa"},
        _ctx(confirmation_present=True),
    )
    assert result.status == "success"
    assert result.data["journey_type"] == "build_villa"
    assert result.data["current_step_key"] == "project_intent"


@pytest.mark.asyncio
async def test_journey_start_unsupported_type(db_session: AsyncSession):
    gateway = ToolGateway(db_session)
    result = await gateway.execute(
        "journey.start",
        {"journey_type": "investment"},
        _ctx(confirmation_present=True),
    )
    assert result.status == "denied"
    assert result.error_code == "UNSUPPORTED_JOURNEY"


@pytest.mark.asyncio
async def test_journey_read_state_cross_user_denied(db_session: AsyncSession):
    jos = JosService(db_session)
    instance = await jos.start_journey("build_villa", anonymous_session_id="owner-session")
    gateway = ToolGateway(db_session)
    result = await gateway.execute(
        "journey.read_state",
        {"journey_instance_id": instance.id},
        _ctx(anonymous_session_id="other-session"),
    )
    assert result.status == "denied"
    assert result.error_code == "JOURNEY_ACCESS_DENIED"


@pytest.mark.asyncio
async def test_service_request_read_requires_auth(db_session: AsyncSession):
    gateway = ToolGateway(db_session)
    result = await gateway.execute("service_request.read_current_user", {}, _ctx(user_id=None))
    assert result.status == "denied"
    assert result.error_code == "AUTH_REQUIRED"


@pytest.mark.asyncio
async def test_service_request_read_detail_cross_user_denied(db_session: AsyncSession):
    jos = JosService(db_session)
    sr_service = ServiceRequestService(db_session)
    user_a = "user-a"
    user_b = "user-b"
    session_id = "anon-sr-tool"

    instance = await jos.start_journey(
        "build_villa",
        anonymous_session_id=session_id,
        user_id=user_a,
    )
    instance = await advance_build_villa_v1_to_terminal(jos, instance.id, session_id)
    await jos.complete(instance.id, anonymous_session_id=session_id, user_id=user_a)
    sr = await sr_service.get_by_journey_instance_id(instance.id)
    assert sr is not None

    gateway = ToolGateway(db_session)
    result = await gateway.execute(
        "service_request.read_detail",
        {"service_request_id": sr.id},
        _ctx(
            user_id=user_b,
            granted_permissions={"journey.start", "journey.resume", "journey.read", "service_request.read_own"},
        ),
    )
    assert result.status == "denied"
    assert result.error_code == "NOT_FOUND"


@pytest.mark.asyncio
async def test_unknown_tool_denied(db_session: AsyncSession):
    gateway = ToolGateway(db_session)
    result = await gateway.execute("run_sql", {}, _ctx())
    assert result.status == "denied"
    assert result.error_code == "UNKNOWN_TOOL"


@pytest.mark.asyncio
async def test_human_handoff_requires_confirmation(db_session: AsyncSession):
    gateway = ToolGateway(db_session)
    denied = await gateway.execute(
        "human_handoff.request",
        {"reason": "احتاج مهندس"},
        _ctx(confirmation_present=False, granted_permissions={"human_handoff.request"}),
    )
    assert denied.status == "denied"
    assert denied.error_code == "CONFIRMATION_MISSING"


@pytest.mark.asyncio
async def test_human_handoff_success(db_session: AsyncSession):
    gateway = ToolGateway(db_session)
    result = await gateway.execute(
        "human_handoff.request",
        {"reason": "احتاج مهندس", "conversation_summary": "سؤال عن طلب"},
        _ctx(confirmation_present=True, granted_permissions={"human_handoff.request"}),
    )
    assert result.status == "success"
    assert result.data["status"] == "queued"
    assert result.data["reason"] == "احتاج مهندس"
