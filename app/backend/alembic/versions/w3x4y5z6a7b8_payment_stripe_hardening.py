"""Stripe payment hardening — webhook idempotency and receipt URL.

Revision ID: w3x4y5z6a7b8
Revises: v2w3x4y5z6a7
Create Date: 2026-09-13 16:05:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "w3x4y5z6a7b8"
down_revision: Union[str, Sequence[str], None] = "v2w3x4y5z6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("payments", sa.Column("stripe_receipt_url", sa.String(length=512), nullable=True))
    op.create_table(
        "stripe_webhook_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("stripe_event_id", sa.String(length=255), nullable=False),
        sa.Column("event_type", sa.String(length=128), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_stripe_webhook_events_id"), "stripe_webhook_events", ["id"], unique=False)
    op.create_index(
        op.f("ix_stripe_webhook_events_stripe_event_id"),
        "stripe_webhook_events",
        ["stripe_event_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_stripe_webhook_events_stripe_event_id"), table_name="stripe_webhook_events")
    op.drop_index(op.f("ix_stripe_webhook_events_id"), table_name="stripe_webhook_events")
    op.drop_table("stripe_webhook_events")
    op.drop_column("payments", "stripe_receipt_url")
