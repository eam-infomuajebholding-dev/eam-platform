"""Partner portal, API keys, webhooks, assignment status.

Revision ID: a8b9c0d1e2f3
Revises: z6a7b8c9d0e1
Create Date: 2026-09-21 16:30:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a8b9c0d1e2f3"
down_revision: Union[str, Sequence[str], None] = "z6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "partner_memberships",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("partner_org_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("invited_by_user_id", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["invited_by_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["partner_org_id"], ["partner_organizations.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("partner_org_id", "user_id", name="uq_partner_membership"),
    )
    op.create_index("ix_partner_memberships_partner_org_id", "partner_memberships", ["partner_org_id"])
    op.create_index("ix_partner_memberships_user_id", "partner_memberships", ["user_id"])

    op.create_table(
        "partner_api_credentials",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("partner_org_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("key_prefix", sa.String(length=16), nullable=False),
        sa.Column("key_hash", sa.String(length=64), nullable=False),
        sa.Column("scopes", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_user_id", sa.String(length=255), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["partner_org_id"], ["partner_organizations.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_partner_api_credentials_key_prefix", "partner_api_credentials", ["key_prefix"])
    op.create_index("ix_partner_api_credentials_partner_org_id", "partner_api_credentials", ["partner_org_id"])

    op.create_table(
        "partner_webhook_subscriptions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("partner_org_id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("secret", sa.String(length=128), nullable=False),
        sa.Column("event_types", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["partner_org_id"], ["partner_organizations.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_partner_webhook_subscriptions_partner_org_id",
        "partner_webhook_subscriptions",
        ["partner_org_id"],
    )

    op.create_table(
        "partner_webhook_deliveries",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("subscription_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("payload_json", sa.JSON(), nullable=False),
        sa.Column("response_status", sa.Integer(), nullable=True),
        sa.Column("success", sa.Boolean(), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["subscription_id"], ["partner_webhook_subscriptions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_partner_webhook_deliveries_subscription_id",
        "partner_webhook_deliveries",
        ["subscription_id"],
    )

    op.add_column(
        "service_requests",
        sa.Column("partner_assignment_status", sa.String(length=32), server_default="none", nullable=False),
    )
    op.add_column("service_requests", sa.Column("partner_responded_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("service_requests", sa.Column("partner_decline_reason", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("service_requests", "partner_decline_reason")
    op.drop_column("service_requests", "partner_responded_at")
    op.drop_column("service_requests", "partner_assignment_status")
    op.drop_index("ix_partner_webhook_deliveries_subscription_id", table_name="partner_webhook_deliveries")
    op.drop_table("partner_webhook_deliveries")
    op.drop_index("ix_partner_webhook_subscriptions_partner_org_id", table_name="partner_webhook_subscriptions")
    op.drop_table("partner_webhook_subscriptions")
    op.drop_index("ix_partner_api_credentials_partner_org_id", table_name="partner_api_credentials")
    op.drop_index("ix_partner_api_credentials_key_prefix", table_name="partner_api_credentials")
    op.drop_table("partner_api_credentials")
    op.drop_index("ix_partner_memberships_user_id", table_name="partner_memberships")
    op.drop_index("ix_partner_memberships_partner_org_id", table_name="partner_memberships")
    op.drop_table("partner_memberships")
