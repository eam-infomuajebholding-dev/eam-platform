"""Building materials journey — procurement invoice flow (v2).

Revision ID: y5z6a7b8c9d0
Revises: x4y5z6a7b8c9
Create Date: 2026-09-21 12:00:00.000000
"""

from __future__ import annotations

import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from services.jos_seed import BUILDING_MATERIALS_WORKFLOW

revision: str = "y5z6a7b8c9d0"
down_revision: Union[str, Sequence[str], None] = "x4y5z6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFINITION = {
    "journey_type": "building_materials",
    "name": "Building Materials Procurement",
    "description": "Materials intake, phone verification, provisional invoice, and payment handoff.",
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
    pass
