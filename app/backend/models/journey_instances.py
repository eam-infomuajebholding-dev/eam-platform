from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.types import JSON

from core.database import Base


class JourneyInstance(Base):
    __tablename__ = "journey_instances"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    journey_definition_id = Column(Integer, ForeignKey("journey_definitions.id"), nullable=False, index=True)
    journey_type = Column(String(64), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="active", server_default="active")
    current_step_key = Column(String(128), nullable=False)
    context = Column(JSON, nullable=False, default=dict)
    user_id = Column(String(255), nullable=True, index=True)
    anonymous_session_id = Column(String(128), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)
    completed_at = Column(DateTime(timezone=True), nullable=True)
