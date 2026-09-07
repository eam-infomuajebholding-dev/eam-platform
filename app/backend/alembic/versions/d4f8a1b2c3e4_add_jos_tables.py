"""Add JOS foundation tables.

Revision ID: d4f8a1b2c3e4
Revises: c104a219e720
Create Date: 2026-09-04 22:30:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d4f8a1b2c3e4"
down_revision: Union[str, Sequence[str], None] = "c104a219e720"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "journey_definitions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("journey_type", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("workflow_definition", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("journey_type", name="uq_journey_definitions_journey_type"),
    )
    op.create_index(op.f("ix_journey_definitions_id"), "journey_definitions", ["id"], unique=False)
    op.create_index(
        op.f("ix_journey_definitions_journey_type"),
        "journey_definitions",
        ["journey_type"],
        unique=False,
    )

    op.create_table(
        "journey_instances",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("journey_definition_id", sa.Integer(), nullable=False),
        sa.Column("journey_type", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="active", nullable=False),
        sa.Column("current_step_key", sa.String(length=128), nullable=False),
        sa.Column("context", sa.JSON(), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=True),
        sa.Column("anonymous_session_id", sa.String(length=128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["journey_definition_id"], ["journey_definitions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_journey_instances_id"), "journey_instances", ["id"], unique=False)
    op.create_index(
        op.f("ix_journey_instances_journey_definition_id"),
        "journey_instances",
        ["journey_definition_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_journey_instances_journey_type"),
        "journey_instances",
        ["journey_type"],
        unique=False,
    )
    op.create_index(op.f("ix_journey_instances_user_id"), "journey_instances", ["user_id"], unique=False)
    op.create_index(
        op.f("ix_journey_instances_anonymous_session_id"),
        "journey_instances",
        ["anonymous_session_id"],
        unique=False,
    )

    op.create_table(
        "journey_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("journey_instance_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("from_step", sa.String(length=128), nullable=True),
        sa.Column("to_step", sa.String(length=128), nullable=True),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["journey_instance_id"], ["journey_instances.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_journey_events_id"), "journey_events", ["id"], unique=False)
    op.create_index(
        op.f("ix_journey_events_journey_instance_id"),
        "journey_events",
        ["journey_instance_id"],
        unique=False,
    )
    op.create_index(op.f("ix_journey_events_event_type"), "journey_events", ["event_type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_journey_events_event_type"), table_name="journey_events")
    op.drop_index(op.f("ix_journey_events_journey_instance_id"), table_name="journey_events")
    op.drop_index(op.f("ix_journey_events_id"), table_name="journey_events")
    op.drop_table("journey_events")

    op.drop_index(op.f("ix_journey_instances_anonymous_session_id"), table_name="journey_instances")
    op.drop_index(op.f("ix_journey_instances_user_id"), table_name="journey_instances")
    op.drop_index(op.f("ix_journey_instances_journey_type"), table_name="journey_instances")
    op.drop_index(op.f("ix_journey_instances_journey_definition_id"), table_name="journey_instances")
    op.drop_index(op.f("ix_journey_instances_id"), table_name="journey_instances")
    op.drop_table("journey_instances")

    op.drop_index(op.f("ix_journey_definitions_journey_type"), table_name="journey_definitions")
    op.drop_index(op.f("ix_journey_definitions_id"), table_name="journey_definitions")
    op.drop_table("journey_definitions")
