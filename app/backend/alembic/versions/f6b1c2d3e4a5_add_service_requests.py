"""Add service_requests business object table.

Revision ID: f6b1c2d3e4a5
Revises: e5a9b2c3d4f5
Create Date: 2026-09-05 00:30:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f6b1c2d3e4a5"
down_revision: Union[str, Sequence[str], None] = "e5a9b2c3d4f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "service_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("journey_instance_id", sa.Integer(), nullable=False),
        sa.Column("journey_type", sa.String(length=64), nullable=False),
        sa.Column("request_type", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="submitted", nullable=False),
        sa.Column("reference_code", sa.String(length=32), nullable=False),
        sa.Column("intake_snapshot", sa.JSON(), nullable=False),
        sa.Column("source_channel", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["journey_instance_id"], ["journey_instances.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("journey_instance_id", name="uq_service_requests_journey_instance_id"),
        sa.UniqueConstraint("reference_code", name="uq_service_requests_reference_code"),
    )
    op.create_index(op.f("ix_service_requests_id"), "service_requests", ["id"], unique=False)
    op.create_index(op.f("ix_service_requests_user_id"), "service_requests", ["user_id"], unique=False)
    op.create_index(
        op.f("ix_service_requests_journey_instance_id"),
        "service_requests",
        ["journey_instance_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_service_requests_journey_type"),
        "service_requests",
        ["journey_type"],
        unique=False,
    )
    op.create_index(
        op.f("ix_service_requests_reference_code"),
        "service_requests",
        ["reference_code"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_service_requests_reference_code"), table_name="service_requests")
    op.drop_index(op.f("ix_service_requests_journey_type"), table_name="service_requests")
    op.drop_index(op.f("ix_service_requests_journey_instance_id"), table_name="service_requests")
    op.drop_index(op.f("ix_service_requests_user_id"), table_name="service_requests")
    op.drop_index(op.f("ix_service_requests_id"), table_name="service_requests")
    op.drop_table("service_requests")
