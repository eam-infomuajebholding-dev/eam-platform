"""Update build_villa journey definition to WO-003 discovery workflow.

Revision ID: e5a9b2c3d4f5
Revises: d4f8a1b2c3e4
Create Date: 2026-09-04 23:00:00.000000
"""

import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e5a9b2c3d4f5"
down_revision: Union[str, Sequence[str], None] = "d4f8a1b2c3e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

BUILD_VILLA_WORKFLOW = {
    "initial_step": "city",
    "steps": [
        {
            "key": "city",
            "label": "Project city",
            "required_fields": ["city"],
            "next": "land_ownership",
        },
        {
            "key": "land_ownership",
            "label": "Land ownership type",
            "required_fields": ["land_ownership_type"],
            "next": "land_area",
        },
        {
            "key": "land_area",
            "label": "Land area",
            "required_fields": ["land_area_sqm"],
            "next": "documents_context",
        },
        {
            "key": "documents_context",
            "label": "Documents and context",
            "required_fields": [],
            "next": "desired_service",
        },
        {
            "key": "desired_service",
            "label": "Desired service",
            "required_fields": ["desired_service"],
            "next": "intake_complete",
        },
        {
            "key": "intake_complete",
            "label": "Intake complete",
            "terminal": True,
        },
    ],
}


def upgrade() -> None:
    workflow_json = json.dumps(BUILD_VILLA_WORKFLOW)
    bind = op.get_bind()
    dialect = bind.dialect.name

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
                WHERE journey_type = 'build_villa'
                """
            ).bindparams(
                name="Build Villa Discovery",
                description="M1 discovery and intake journey for Build Villa.",
                workflow=workflow_json,
            )
        )
        op.execute(
            sa.text(
                """
                INSERT INTO journey_definitions
                    (journey_type, name, description, workflow_definition, is_active, created_at, updated_at)
                SELECT :journey_type, :name, :description, CAST(:workflow AS JSONB), true, NOW(), NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM journey_definitions WHERE journey_type = 'build_villa'
                )
                """
            ).bindparams(
                journey_type="build_villa",
                name="Build Villa Discovery",
                description="M1 discovery and intake journey for Build Villa.",
                workflow=workflow_json,
            )
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
            WHERE journey_type = 'build_villa'
            """
        ).bindparams(
            name="Build Villa Discovery",
            description="M1 discovery and intake journey for Build Villa.",
            workflow=workflow_json,
        )
    )
    op.execute(
        sa.text(
            """
            INSERT INTO journey_definitions
                (journey_type, name, description, workflow_definition, is_active, created_at, updated_at)
            SELECT :journey_type, :name, :description, :workflow, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            WHERE NOT EXISTS (
                SELECT 1 FROM journey_definitions WHERE journey_type = 'build_villa'
            )
            """
        ).bindparams(
            journey_type="build_villa",
            name="Build Villa Discovery",
            description="M1 discovery and intake journey for Build Villa.",
            workflow=workflow_json,
        )
    )


def downgrade() -> None:
    stub_workflow = {
        "initial_step": "initiated",
        "steps": [
            {
                "key": "initiated",
                "label": "Build Villa journey initiated",
                "required_fields": [],
                "next": "context_placeholder",
            },
            {
                "key": "context_placeholder",
                "label": "Context collection placeholder",
                "required_fields": ["placeholder_context"],
                "next": "ready",
            },
            {
                "key": "ready",
                "label": "Ready for WO-003 activation",
                "terminal": True,
            },
        ],
    }
    workflow_json = json.dumps(stub_workflow)
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect == "postgresql":
        op.execute(
            sa.text(
                """
                UPDATE journey_definitions
                SET name = :name,
                    description = :description,
                    workflow_definition = CAST(:workflow AS JSONB),
                    updated_at = NOW()
                WHERE journey_type = 'build_villa'
                """
            ).bindparams(
                name="Build Villa (Stub)",
                description="Placeholder Build Villa journey definition. Business steps are implemented in WO-003.",
                workflow=workflow_json,
            )
        )
        return

    op.execute(
        sa.text(
            """
            UPDATE journey_definitions
            SET name = :name,
                description = :description,
                workflow_definition = :workflow,
                updated_at = CURRENT_TIMESTAMP
            WHERE journey_type = 'build_villa'
            """
        ).bindparams(
            name="Build Villa (Stub)",
            description="Placeholder Build Villa journey definition. Business steps are implemented in WO-003.",
            workflow=workflow_json,
        )
    )
