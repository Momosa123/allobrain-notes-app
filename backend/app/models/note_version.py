# backend/app/models/note_version.py
from app.db.base import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

# from sqlalchemy.orm import relationship # Keep commented for now


class NoteVersion(Base):
    __tablename__ = "note_versions"  # Name of the table in the DB

    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(
        Integer, ForeignKey("notes.id"), nullable=False, index=True
    )  # Foreign key to notes.id
    title = Column(String(100), nullable=False)  # or Text() if no limit needed
    content = Column(Text, nullable=False)
    # Use server_default with func.now() for DB compatibility
    # timezone=True is important for storing timezone info if DB supports it
    version_timestamp = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Optional: Relationship to easily access the original note from a version
    # note = relationship("Note", back_populates="versions")
