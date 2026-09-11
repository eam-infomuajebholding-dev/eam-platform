"""Alembic / JOS definition deployment safety tests (WO-006 STREAM A)."""

from __future__ import annotations

from pathlib import Path

import pytest
from alembic.config import Config
from alembic.script import ScriptDirectory

from services.build_villa_schema import BUILD_VILLA_STEP_ORDER
from services.jos_seed import BUILD_VILLA_WORKFLOW, ENGINEERING_CONSULTING_WORKFLOW


def test_single_alembic_head():
    backend_root = Path(__file__).resolve().parents[1]
    cfg = Config(str(backend_root / "alembic.ini"))
    script = ScriptDirectory.from_config(cfg)
    heads = script.get_heads()
    assert len(heads) == 1
    assert heads[0] == "t0u1v2w3x4y5"


def test_build_villa_workflow_matches_canonical_v1_order():
    step_keys = [step["key"] for step in BUILD_VILLA_WORKFLOW["steps"]]
    assert BUILD_VILLA_WORKFLOW["initial_step"] == "project_intent"
    assert step_keys == BUILD_VILLA_STEP_ORDER


def test_engineering_consulting_workflow_is_deployable():
    assert ENGINEERING_CONSULTING_WORKFLOW["initial_step"] == "intent"
    assert any(step.get("terminal") for step in ENGINEERING_CONSULTING_WORKFLOW["steps"])


def test_v1_migration_module_imports_canonical_workflows():
    migration_path = (
        Path(__file__).resolve().parents[1]
        / "alembic"
        / "versions"
        / "f7g8h9i0j1k2_update_jos_v1_definitions.py"
    )
    assert migration_path.exists()
    source = migration_path.read_text(encoding="utf-8")
    assert "BUILD_VILLA_WORKFLOW" in source
    assert "ENGINEERING_CONSULTING_WORKFLOW" in source


@pytest.mark.parametrize(
    "journey_type,workflow",
    [
        ("build_villa", BUILD_VILLA_WORKFLOW),
        ("engineering_consulting", ENGINEERING_CONSULTING_WORKFLOW),
    ],
)
def test_workflow_has_unique_step_keys(journey_type: str, workflow: dict):
    keys = [step["key"] for step in workflow["steps"]]
    assert len(keys) == len(set(keys)), journey_type
