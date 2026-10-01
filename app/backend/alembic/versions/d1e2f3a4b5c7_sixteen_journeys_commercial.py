"""16 LIVE journeys + commercial acceptance tables.

Revision ID: d1e2f3a4b5c7
Revises: c0d1e2f4a5b6
Create Date: 2026-10-01 12:00:00.000000
"""

from __future__ import annotations

import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from services.jos_seed import (
    DELIVERY_WARRANTY_WORKFLOW,
    FACTORIES_SUPPLIERS_WORKFLOW,
    INVESTMENT_WORKFLOW,
)

revision: str = "d1e2f3a4b5c7"
down_revision: Union[str, Sequence[str], None] = "c0d1e2f4a5b6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

JOURNEY_DEFS = [
    {
        "journey_type": "investment",
        "name": "Investment Interest Intake",
        "description": "Pilot #03 investment preliminary interest journey.",
        "workflow_definition": INVESTMENT_WORKFLOW,
    },
    {
        "journey_type": "factories_suppliers",
        "name": "Factories & Suppliers Intake",
        "description": "Pilot #12 supplier readiness journey.",
        "workflow_definition": FACTORIES_SUPPLIERS_WORKFLOW,
    },
    {
        "journey_type": "delivery_warranty",
        "name": "Delivery & Owner Services Intake",
        "description": "Pilot #16 handover support journey.",
        "workflow_definition": DELIVERY_WARRANTY_WORKFLOW,
    },
]


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
                SET name = :name, description = :description,
                    workflow_definition = CAST(:workflow AS JSONB),
                    is_active = true, updated_at = NOW()
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
                WHERE NOT EXISTS (SELECT 1 FROM journey_definitions WHERE journey_type = :journey_type)
                """
            ).bindparams(**params)
        )
        return
    op.execute(
        sa.text(
            """
            UPDATE journey_definitions
            SET name = :name, description = :description, workflow_definition = :workflow,
                is_active = 1, updated_at = CURRENT_TIMESTAMP
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
            WHERE NOT EXISTS (SELECT 1 FROM journey_definitions WHERE journey_type = :journey_type)
            """
        ).bindparams(**params)
    )


def upgrade() -> None:
    op.create_table(
        "commercial_contracts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("service_request_id", sa.Integer(), nullable=False),
        sa.Column("quote_id", sa.Integer(), nullable=False),
        sa.Column("reference_code", sa.String(length=32), nullable=False),
        sa.Column("terms_version", sa.String(length=32), nullable=False),
        sa.Column("customer_acknowledged", sa.Boolean(), server_default="1", nullable=False),
        sa.Column("accepted_by_user_id", sa.String(length=255), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("summary_ar", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"]),
        sa.ForeignKeyConstraint(["service_request_id"], ["service_requests.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_code"),
        sa.UniqueConstraint("service_request_id"),
    )
    op.create_index("ix_commercial_contracts_quote_id", "commercial_contracts", ["quote_id"])
    op.create_index("ix_commercial_contracts_service_request_id", "commercial_contracts", ["service_request_id"])

    op.create_table(
        "operational_projects",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("service_request_id", sa.Integer(), nullable=False),
        sa.Column("quote_id", sa.Integer(), nullable=True),
        sa.Column("reference_code", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="planned", nullable=False),
        sa.Column("title_ar", sa.String(length=255), nullable=True),
        sa.Column("internal_note", sa.Text(), nullable=True),
        sa.Column("opened_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"]),
        sa.ForeignKeyConstraint(["service_request_id"], ["service_requests.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_code"),
        sa.UniqueConstraint("service_request_id"),
    )
    op.create_index("ix_operational_projects_quote_id", "operational_projects", ["quote_id"])
    op.create_index("ix_operational_projects_service_request_id", "operational_projects", ["service_request_id"])

    bind = op.get_bind()
    for item in JOURNEY_DEFS:
        _upsert_definition(dialect=bind.dialect.name, item=item)


def downgrade() -> None:
    for jt in ("investment", "factories_suppliers", "delivery_warranty"):
        op.execute(sa.text(f"UPDATE journey_definitions SET is_active = 0 WHERE journey_type = '{jt}'"))
    op.drop_index("ix_operational_projects_service_request_id", table_name="operational_projects")
    op.drop_index("ix_operational_projects_quote_id", table_name="operational_projects")
    op.drop_table("operational_projects")
    op.drop_index("ix_commercial_contracts_service_request_id", table_name="commercial_contracts")
    op.drop_index("ix_commercial_contracts_quote_id", table_name="commercial_contracts")
    op.drop_table("commercial_contracts")
