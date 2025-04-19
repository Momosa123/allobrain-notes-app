# backend/app/schemas/note_version.py
from datetime import datetime

from pydantic import BaseModel


# Shared properties for all versions (Base)
class NoteVersionBase(BaseModel):
    title: str
    content: str
    note_id: int


# Properties required when creating a version (used internally)
# We don't include version_timestamp here as the DB handles it with server_default
class NoteVersionCreate(NoteVersionBase):
    pass


# Properties of a version read from the DB (includes id and timestamp)
class NoteVersionInDBBase(NoteVersionBase):
    id: int
    version_timestamp: datetime

    class Config:
        from_attributes = True  # Formerly orm_mode = True


# Main schema for returning a version via API (if needed later)
class NoteVersion(NoteVersionInDBBase):
    pass


# Optional: If we want to return versions within the note itself (less likely)
# class NoteVersionWithNote(NoteVersion):
#    note: Note # Would require importing Note from schemas.note
