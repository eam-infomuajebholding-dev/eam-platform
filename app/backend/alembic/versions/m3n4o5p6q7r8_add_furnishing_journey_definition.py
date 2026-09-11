"""Add Furnishing (#15) journey definition.

Revision ID: m3n4o5p6q7r8
Revises: l2m3n4o5p6q7
Create Date: 2026-09-11 10:45:00.000000
"""

from __future__ import annotations

import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from services.jos_seed import FURNISHING_WORKFLOW

revision: str = "m3n4o5p6q7r8"
down_revision: Union[str, Sequence[str], None] = "l2m3n4o5p6q7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFINITION = {
    "journey_type": "furnishing",
    "name": "Furnishing Readiness Intake",
    "description": "Pilot #15 furnishing readiness discovery journey.",
    "workflow_definition": FURNISHING_WORKFLOW,
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
                UPDATE journey_definitions
                SET name = :name,
                    description = :description,
                    workflow_definition = CAST(:workflow AS JSONB),
                    is_active = true,
                    updated_at = NOW()
                WHERE journey_type = :journey_type
                """
            ).bindparams(**params)
        )
        op.execute(
            sa.text(
                """
                INSERT INTO journey_definitions
                    (journey_type, name, description, workflow_definition, is_active, created_at, updated_at)
                SELECT :journey_type, :name, :description, CAST(:workflow AS JSONB), true, NOW(), NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM journey_definitions WHERE journey_type = :journey_type
                )
                """
            ).bindparams(**params)
        )
        return

    op.execute(
        sa.text(
            """
            UPDATE journey_definitions
            SET name = :name,
                description = :description,
                workflow_definition = :workflow,
                is_active = 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE journey_type = :journey_type
            """
        ).bindparams(**params)
    )
    op.execute(
        sa.text(
            """
            INSERT INTO journey_definitions
                (journey_type, name, description, workflow_definition, is_active, created_at, updated_at)
            SELECT :journey_type, :name, :description, :workflow, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            WHERE NOT EXISTS (
                SELECT 1 FROM journey_definitions WHERE journey_type = :journey_type
            )
            """
        ).bindparams(**params)
    )


def upgrade() -> None:
    bind = op.get_bind()
    _upsert_definition(dialect=bind.dialect.name)


def downgrade() -> None:
    op.execute(
        sa.text("UPDATE journey_definitions SET is_active = 0 WHERE journey_type = 'furnishing'")
    )
