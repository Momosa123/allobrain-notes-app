from sqlalchemy import Column, DateTime, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.base import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, index=True, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Define the relationship to NoteVersion
    versions = relationship(
        "NoteVersion",
        back_populates="note",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
