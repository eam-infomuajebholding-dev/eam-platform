"""Add quotes and quote_line_items tables (WO-018).

Revision ID: t0u1v2w3x4y5
Revises: s9t0u1v2w3x4
Create Date: 2026-09-11 20:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "t0u1v2w3x4y5"
down_revision: Union[str, Sequence[str], None] = "s9t0u1v2w3x4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "quotes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("service_request_id", sa.Integer(), nullable=False),
        sa.Column("reference_code", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("currency", sa.String(length=3), server_default="SAR", nullable=False),
        sa.Column("subtotal", sa.Numeric(precision=12, scale=2), server_default="0", nullable=False),
        sa.Column("vat_rate", sa.Numeric(precision=5, scale=4), server_default="0.15", nullable=False),
        sa.Column("vat_amount", sa.Numeric(precision=12, scale=2), server_default="0", nullable=False),
        sa.Column("total_amount", sa.Numeric(precision=12, scale=2), server_default="0", nullable=False),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_user_id", sa.String(length=255), nullable=False),
        sa.Column("approved_by_user_id", sa.String(length=255), nullable=True),
        sa.Column("internal_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["service_request_id"], ["service_requests.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_code", name="uq_quotes_reference_code"),
        sa.UniqueConstraint("service_request_id", name="uq_quotes_service_request_id"),
    )
    op.create_index(op.f("ix_quotes_id"), "quotes", ["id"], unique=False)
    op.create_index(op.f("ix_quotes_service_request_id"), "quotes", ["service_request_id"], unique=False)
    op.create_index(op.f("ix_quotes_reference_code"), "quotes", ["reference_code"], unique=False)

    op.create_table(
        "quote_line_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("quote_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=512), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=10, scale=2), server_default="1", nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_quote_line_items_id"), "quote_line_items", ["id"], unique=False)
    op.create_index(op.f("ix_quote_line_items_quote_id"), "quote_line_items", ["quote_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_quote_line_items_quote_id"), table_name="quote_line_items")
    op.drop_index(op.f("ix_quote_line_items_id"), table_name="quote_line_items")
    op.drop_table("quote_line_items")
    op.drop_index(op.f("ix_quotes_reference_code"), table_name="quotes")
    op.drop_index(op.f("ix_quotes_service_request_id"), table_name="quotes")
    op.drop_index(op.f("ix_quotes_id"), table_name="quotes")
    op.drop_table("quotes")
