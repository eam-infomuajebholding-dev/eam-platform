from models.base import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func


class CommandCenterDelegation(Base):
    """Owner-granted command center access for a delegate user."""

    __tablename__ = "command_center_delegations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    delegate_user_id = Column(String(255), ForeignKey("users.id"), nullable=False, index=True)
    granted_by_user_id = Column(String(255), ForeignKey("users.id"), nullable=False)
    permissions = Column(String(255), nullable=False, default="read,search,executive_brief,evidence")
    note = Column(Text(), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
