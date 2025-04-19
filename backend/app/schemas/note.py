from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# Base Schema
class NoteBase(BaseModel):
    title: str
    content: str


# Schema for creation
class NoteCreate(NoteBase):
    pass  # No more field for a creation


# Schema for updates
# Fields are optional because we may just update one field
class NoteUpdate(NoteBase):
    title: Optional[str] = None
    content: Optional[str] = None


# Schema for reading from DB
class NoteIndDBBase(NoteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Pydantic config to read from an ORM
    model_config = ConfigDict(from_attributes=True)


# Schema to send note via API
class Note(NoteIndDBBase):
    pass
