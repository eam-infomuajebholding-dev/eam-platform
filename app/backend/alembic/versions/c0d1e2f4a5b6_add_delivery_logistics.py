"""Delivery logistics shipments.

Revision ID: c0d1e2f4a5b6
Revises: b9c0d1e2f4a5
Create Date: 2026-09-21 22:00:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c0d1e2f4a5b6"
down_revision: Union[str, Sequence[str], None] = "b9c0d1e2f4a5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "delivery_shipments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("procurement_order_id", sa.Integer(), nullable=False),
        sa.Column("service_request_id", sa.Integer(), nullable=False),
        sa.Column("reference_code", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="awaiting_dispatch", nullable=False),
        sa.Column("delivery_address", sa.String(length=500), nullable=True),
        sa.Column("carrier_name", sa.String(length=120), nullable=True),
        sa.Column("tracking_number", sa.String(length=120), nullable=True),
        sa.Column("estimated_delivery_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("partner_org_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["partner_org_id"], ["partner_organizations.id"]),
        sa.ForeignKeyConstraint(["procurement_order_id"], ["procurement_orders.id"]),
        sa.ForeignKeyConstraint(["service_request_id"], ["service_requests.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("procurement_order_id"),
        sa.UniqueConstraint("reference_code"),
    )
    op.create_index("ix_delivery_shipments_partner_org_id", "delivery_shipments", ["partner_org_id"])
    op.create_index("ix_delivery_shipments_reference_code", "delivery_shipments", ["reference_code"])
    op.create_index("ix_delivery_shipments_service_request_id", "delivery_shipments", ["service_request_id"])

    op.create_table(
        "delivery_shipment_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("shipment_id", sa.Integer(), nullable=False),
        sa.Column("from_status", sa.String(length=32), nullable=False),
        sa.Column("to_status", sa.String(length=32), nullable=False),
        sa.Column("actor_role", sa.String(length=32), nullable=False),
        sa.Column("actor_user_id", sa.String(length=255), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["shipment_id"], ["delivery_shipments.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_delivery_shipment_events_shipment_id", "delivery_shipment_events", ["shipment_id"])


def downgrade() -> None:
    op.drop_index("ix_delivery_shipment_events_shipment_id", table_name="delivery_shipment_events")
    op.drop_table("delivery_shipment_events")
    op.drop_index("ix_delivery_shipments_service_request_id", table_name="delivery_shipments")
    op.drop_index("ix_delivery_shipments_reference_code", table_name="delivery_shipments")
    op.drop_index("ix_delivery_shipments_partner_org_id", table_name="delivery_shipments")
    op.drop_table("delivery_shipments")
