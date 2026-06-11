from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Navigation_items(Base):
    __tablename__ = "navigation_items"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    label = Column(String, nullable=False)
    path = Column(String, nullable=False)
    parent_id = Column(Integer, nullable=True)
    sort_order = Column(Integer, nullable=False)
    is_visible = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)