"""Add command_center_delegations for owner-granted dashboard access.

Revision ID: u1v2w3x4y5z6
Revises: t0u1v2w3x4y5
Create Date: 2026-09-13 10:30:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "u1v2w3x4y5z6"
down_revision: Union[str, Sequence[str], None] = "t0u1v2w3x4y5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "command_center_delegations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("delegate_user_id", sa.String(length=255), nullable=False),
        sa.Column("granted_by_user_id", sa.String(length=255), nullable=False),
        sa.Column("permissions", sa.String(length=255), server_default="read,search,executive_brief,evidence", nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["delegate_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["granted_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_command_center_delegations_delegate_user_id",
        "command_center_delegations",
        ["delegate_user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_command_center_delegations_delegate_user_id", table_name="command_center_delegations")
    op.drop_table("command_center_delegations")
