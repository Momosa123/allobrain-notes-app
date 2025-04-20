from app.db.base import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class NoteVersion(Base):
    __tablename__ = "note_versions"

    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(
        Integer, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True
    )  # Foreign key to notes.id
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)

    version_timestamp = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Define the relationship back to the Note
    note = relationship("Note", back_populates="versions")
