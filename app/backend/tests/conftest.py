"""Shared pytest configuration for CI-compatible ASGI integration tests."""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

import pytest


@pytest.fixture(scope="session", autouse=True)
def ci_test_environment():
    """Ensure DATABASE_URL and JWT env exist before any test imports hit the app DB."""
    os.environ.setdefault("DATABASE_URL", "sqlite:///./ci_test.db")
    os.environ.setdefault("JWT_SECRET_KEY", "ci-test-jwt-secret")
    os.environ.setdefault("JWT_EXPIRE_MINUTES", "60")
    os.environ.setdefault("JWT_ALGORITHM", "HS256")
    db_path = Path("ci_test.db")
    if db_path.exists():
        db_path.unlink()
    yield


@pytest.fixture(scope="session", autouse=True)
def bootstrap_application_database(ci_test_environment):
    """Mirror application startup so HTTP integration tests share initialized schema + JOS seed."""

    async def _startup() -> None:
        from core.database import db_manager
        from services.auth import initialize_admin_user
        from services.database import initialize_database
        from services.jos_seed import initialize_jos_definitions
        from services.mock_data import initialize_mock_data

        await initialize_database()
        await initialize_mock_data()
        await initialize_admin_user()
        await db_manager.ensure_initialized()
        if db_manager.async_session_maker is None:
            raise RuntimeError("Database session maker unavailable after test bootstrap")
        async with db_manager.async_session_maker() as session:
            await initialize_jos_definitions(session)

    asyncio.run(_startup())
    yield
