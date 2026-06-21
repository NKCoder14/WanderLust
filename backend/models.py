from sqlalchemy import ( Column, Integer, String, Boolean, DateTime, Text, ForeignKey )
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime, timezone

class Base(DeclarativeBase):
    pass

class Run(Base):
    __tablename__ = "runs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    status = Column(String(20), nullable=False, default="running") 
    event_count = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    events = relationship("Event", back_populates="run", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Run id={self.id} status={self.status}>"

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    date = Column(String(200), nullable=True)
    location = Column(String(300), nullable=True)
    link = Column(String(1000), nullable=True)
    source = Column(String(50), nullable=True)
    type = Column(String(50), nullable=True)
    relevance_score = Column(Integer, nullable=True)
    why_relevant = Column(Text, nullable=True)
    is_free_or_student = Column(Boolean, nullable=True)
    run_id = Column(Integer, ForeignKey("runs.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    run = relationship("Run", back_populates="events")

    def To_Dictionary(self):
        return {
            "title": self.title,
            "date": self.date,
            "location": self.location,
            "link": self.link,
            "source": self.source,
            "type": self.type,
            "relevance_score": self.relevance_score,
            "why_relevant": self.why_relevant,
            "is_free_or_student": self.is_free_or_student,
        }


class Config(Base):
    __tablename__ = "config"
    id = Column(Integer, primary_key=True, default=1)
    user_profile = Column(JSONB, nullable=True)
    cities = Column(JSONB, nullable=True)
    search_queries = Column(JSONB, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))