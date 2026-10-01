"""Procurement orders (أمر شراء) for building materials.

Revision ID: b9c0d1e2f4a5
Revises: a8b9c0d1e2f3
Create Date: 2026-09-21 20:00:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b9c0d1e2f4a5"
down_revision: Union[str, Sequence[str], None] = "a8b9c0d1e2f3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "procurement_orders",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("service_request_id", sa.Integer(), nullable=False),
        sa.Column("reference_code", sa.String(length=32), nullable=False),
        sa.Column("journey_type", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="provisional", nullable=False),
        sa.Column("currency", sa.String(length=8), server_default="SAR", nullable=False),
        sa.Column("total_amount", sa.Numeric(14, 2), nullable=True),
        sa.Column("line_items", sa.JSON(), nullable=False),
        sa.Column("delivery_location", sa.String(length=500), nullable=True),
        sa.Column("partner_org_id", sa.Integer(), nullable=True),
        sa.Column("invoice_snapshot", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["partner_org_id"], ["partner_organizations.id"]),
        sa.ForeignKeyConstraint(["service_request_id"], ["service_requests.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_code"),
        sa.UniqueConstraint("service_request_id"),
    )
    op.create_index("ix_procurement_orders_journey_type", "procurement_orders", ["journey_type"])
    op.create_index("ix_procurement_orders_partner_org_id", "procurement_orders", ["partner_org_id"])
    op.create_index("ix_procurement_orders_reference_code", "procurement_orders", ["reference_code"])
    op.create_index("ix_procurement_orders_service_request_id", "procurement_orders", ["service_request_id"])


def downgrade() -> None:
    op.drop_index("ix_procurement_orders_service_request_id", table_name="procurement_orders")
    op.drop_index("ix_procurement_orders_reference_code", table_name="procurement_orders")
    op.drop_index("ix_procurement_orders_partner_org_id", table_name="procurement_orders")
    op.drop_index("ix_procurement_orders_journey_type", table_name="procurement_orders")
    op.drop_table("procurement_orders")
