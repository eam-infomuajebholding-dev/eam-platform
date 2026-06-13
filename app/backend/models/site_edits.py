from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Site_edits(Base):
    __tablename__ = "site_edits"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    page = Column(String, nullable=False)
    element_key = Column(String, nullable=False)
    edit_type = Column(String, nullable=False)
    value = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)