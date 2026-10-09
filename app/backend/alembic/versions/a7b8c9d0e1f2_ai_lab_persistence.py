"""AI Lab persistence: conversations, durable handoff, usage, shared rate limit.

Revision ID: a7b8c9d0e1f2
Revises: z6a7b8c9d0e1
Create Date: 2026-10-07 13:40:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "z6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_conversations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("actor_key", sa.String(length=320), nullable=False),
        sa.Column("surface", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_conversations_actor_key", "ai_conversations", ["actor_key"])
    op.create_table(
        "ai_conversation_messages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("conversation_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_conversation_messages_conversation_id", "ai_conversation_messages", ["conversation_id"])
    op.create_table(
        "ai_handoffs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("trace_id", sa.String(length=64), nullable=False),
        sa.Column("actor_key", sa.String(length=320), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("journey_instance_id", sa.Integer(), nullable=True),
        sa.Column("service_request_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_handoffs_trace_id", "ai_handoffs", ["trace_id"])
    op.create_index("ix_ai_handoffs_actor_key", "ai_handoffs", ["actor_key"])
    op.create_table(
        "ai_usage_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("client_key", sa.String(length=320), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_usage_events_client_key", "ai_usage_events", ["client_key"])
    op.create_table(
        "ai_token_usage",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("model", sa.String(length=64), nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), nullable=False),
        sa.Column("completion_tokens", sa.Integer(), nullable=False),
        sa.Column("total_tokens", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("ai_token_usage")
    op.drop_index("ix_ai_usage_events_client_key", table_name="ai_usage_events")
    op.drop_table("ai_usage_events")
    op.drop_index("ix_ai_handoffs_actor_key", table_name="ai_handoffs")
    op.drop_index("ix_ai_handoffs_trace_id", table_name="ai_handoffs")
    op.drop_table("ai_handoffs")
    op.drop_index("ix_ai_conversation_messages_conversation_id", table_name="ai_conversation_messages")
    op.drop_table("ai_conversation_messages")
    op.drop_index("ix_ai_conversations_actor_key", table_name="ai_conversations")
    op.drop_table("ai_conversations")
