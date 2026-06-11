from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Projects(Base):
    __tablename__ = "projects"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    type = Column(String, nullable=True)
    investment_amount = Column(String, nullable=True)
    expected_return = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    description = Column(String, nullable=False)
    video_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)