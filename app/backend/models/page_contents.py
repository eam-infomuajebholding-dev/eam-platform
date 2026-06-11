from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Page_contents(Base):
    __tablename__ = "page_contents"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    page_key = Column(String, nullable=False)
    section_key = Column(String, nullable=False)
    title = Column(String, nullable=True)
    content = Column(String, nullable=True)
    sort_order = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)