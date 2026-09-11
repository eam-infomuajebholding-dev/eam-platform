"""Add Building Materials (#10) journey definition.

Revision ID: r8s9t0u1v2w3
Revises: q7r8s9t0u1v2
Create Date: 2026-09-11 19:30:00.000000
"""

from __future__ import annotations

import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from services.jos_seed import BUILDING_MATERIALS_WORKFLOW

revision: str = "r8s9t0u1v2w3"
down_revision: Union[str, Sequence[str], None] = "q7r8s9t0u1v2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFINITION = {
    "journey_type": "building_materials",
    "name": "Building Materials Intake",
    "description": "Pilot #10 building materials preliminary procurement brief journey.",
    "workflow_definition": BUILDING_MATERIALS_WORKFLOW,
}


def _upsert_definition(*, dialect: str) -> None:
    workflow_json = json.dumps(DEFINITION["workflow_definition"])
    params = {
        "journey_type": DEFINITION["journey_type"],
        "name": DEFINITION["name"],
        "description": DEFINITION["description"],
        "workflow": workflow_json,
    }

    if dialect == "postgresql":
        op.execute(
            sa.text(
                """
                INSERT INTO journey_definitions (journey_type, name, description, workflow_definition)
                VALUES (:journey_type, :name, :description, CAST(:workflow AS jsonb))
                ON CONFLICT (journey_type) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    workflow_definition = EXCLUDED.workflow_definition
                """
            ).bindparams(**params)
        )
    else:
        op.execute(
            sa.text(
                """
                INSERT INTO journey_definitions (journey_type, name, description, workflow_definition)
                VALUES (:journey_type, :name, :description, :workflow)
                ON CONFLICT (journey_type) DO UPDATE SET
                    name = excluded.name,
                    description = excluded.description,
                    workflow_definition = excluded.workflow_definition
                """
            ).bindparams(**params)
        )


def upgrade() -> None:
    bind = op.get_bind()
    _upsert_definition(dialect=bind.dialect.name)


def downgrade() -> None:
    op.execute(
        sa.text("DELETE FROM journey_definitions WHERE journey_type = :journey_type").bindparams(
            journey_type=DEFINITION["journey_type"]
        )
    )
