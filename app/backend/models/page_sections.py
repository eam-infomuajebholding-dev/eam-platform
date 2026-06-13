from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Page_sections(Base):
    __tablename__ = "page_sections"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    page_name = Column(String, nullable=False)
    section_data = Column(String, nullable=False)
    sort_order = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)