"""Startup failure semantics for required JOS initialization."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from fastapi import FastAPI

from main import lifespan


@pytest.mark.asyncio
async def test_startup_fails_when_jos_seed_fails_after_db_init():
    app = FastAPI()

    with patch("main.initialize_jos_definitions", new_callable=AsyncMock) as mock_seed:
        mock_seed.side_effect = RuntimeError("JOS seed failed")

        with pytest.raises(RuntimeError, match="JOS seed failed"):
            async with lifespan(app):
                pass
