"""Deploy canonical Build Villa V1 and Engineering Consulting journey definitions.

Revision ID: f7g8h9i0j1k2
Revises: f6b1c2d3e4a5
Create Date: 2026-09-10 22:50:00.000000

Active instances pin workflow at start (_pinned_workflow in instance context),
so updating journey_definitions is safe for new instances without forcing restarts.
"""

from __future__ import annotations

import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from services.jos_seed import BUILD_VILLA_WORKFLOW, ENGINEERING_CONSULTING_WORKFLOW

revision: str = "f7g8h9i0j1k2"
down_revision: Union[str, Sequence[str], None] = "f6b1c2d3e4a5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFINITIONS = (
    {
        "journey_type": "build_villa",
        "name": "Build Villa Discovery",
        "description": "M1 discovery and intake journey for Build Villa.",
        "workflow_definition": BUILD_VILLA_WORKFLOW,
    },
    {
        "journey_type": "engineering_consulting",
        "name": "Engineering Consulting Intake",
        "description": "Pilot #08 engineering consulting discovery journey.",
        "workflow_definition": ENGINEERING_CONSULTING_WORKFLOW,
    },
)


def _upsert_definition(*, dialect: str, item: dict) -> None:
    workflow_json = json.dumps(item["workflow_definition"])
    params = {
        "journey_type": item["journey_type"],
        "name": item["name"],
        "description": item["description"],
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
    dialect = bind.dialect.name
    for item in DEFINITIONS:
        _upsert_definition(dialect=dialect, item=item)


def downgrade() -> None:
    # Keep deployed definitions in place; downgrading would reintroduce legacy drift.
    pass
