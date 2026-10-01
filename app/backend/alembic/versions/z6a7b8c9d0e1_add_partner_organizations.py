"""Partner organizations and outlets for company onboarding.

Revision ID: z6a7b8c9d0e1
Revises: y5z6a7b8c9d0
Create Date: 2026-09-21 15:00:00.000000
"""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "z6a7b8c9d0e1"
down_revision: Union[str, Sequence[str], None] = "y5z6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "partner_organizations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("legal_name", sa.String(length=255), nullable=False),
        sa.Column("display_name_ar", sa.String(length=255), nullable=False),
        sa.Column("display_name_en", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=32), server_default="prospect", nullable=False),
        sa.Column("journey_types", sa.JSON(), nullable=False),
        sa.Column("sector_slugs", sa.JSON(), nullable=False),
        sa.Column("contact_name", sa.String(length=120), nullable=True),
        sa.Column("contact_email", sa.String(length=255), nullable=True),
        sa.Column("contact_phone", sa.String(length=32), nullable=True),
        sa.Column("internal_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_partner_organizations_slug"), "partner_organizations", ["slug"], unique=True)

    op.create_table(
        "partner_outlets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("partner_org_id", sa.Integer(), nullable=False),
        sa.Column("outlet_code", sa.String(length=64), nullable=False),
        sa.Column("name_ar", sa.String(length=255), nullable=False),
        sa.Column("name_en", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=120), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["partner_org_id"], ["partner_organizations.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("partner_org_id", "outlet_code", name="uq_partner_outlet_code"),
    )
    op.create_index(op.f("ix_partner_outlets_partner_org_id"), "partner_outlets", ["partner_org_id"], unique=False)

    op.add_column("service_requests", sa.Column("partner_org_id", sa.Integer(), nullable=True))
    op.add_column("service_requests", sa.Column("partner_outlet_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_service_requests_partner_org_id",
        "service_requests",
        "partner_organizations",
        ["partner_org_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_service_requests_partner_outlet_id",
        "service_requests",
        "partner_outlets",
        ["partner_outlet_id"],
        ["id"],
    )
    op.create_index(op.f("ix_service_requests_partner_org_id"), "service_requests", ["partner_org_id"], unique=False)
    op.create_index(
        op.f("ix_service_requests_partner_outlet_id"), "service_requests", ["partner_outlet_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_service_requests_partner_outlet_id"), table_name="service_requests")
    op.drop_index(op.f("ix_service_requests_partner_org_id"), table_name="service_requests")
    op.drop_constraint("fk_service_requests_partner_outlet_id", "service_requests", type_="foreignkey")
    op.drop_constraint("fk_service_requests_partner_org_id", "service_requests", type_="foreignkey")
    op.drop_column("service_requests", "partner_outlet_id")
    op.drop_column("service_requests", "partner_org_id")
    op.drop_index(op.f("ix_partner_outlets_partner_org_id"), table_name="partner_outlets")
    op.drop_table("partner_outlets")
    op.drop_index(op.f("ix_partner_organizations_slug"), table_name="partner_organizations")
    op.drop_table("partner_organizations")
