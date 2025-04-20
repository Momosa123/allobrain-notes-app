from typing import List, Optional

from sqlalchemy import desc  # To sort by date descending
from sqlalchemy.orm import Session

from .. import crud, models


def get_note_versions(
    db: Session, note_id: int, skip: int = 0, limit: int = 100
) -> List[models.NoteVersion]:
    """
    Fetches all versions for a specific note, ordered by creation time descending.

    Args:
        db: The database session.
        note_id: The ID of the note whose versions are to be retrieved.
        skip: The number of versions to skip (for pagination).
        limit: The maximum number of versions to return.

    Returns:
        A list of SQLAlchemy NoteVersion model instances.
    """
    return (
        db.query(models.NoteVersion)
        .filter(models.NoteVersion.note_id == note_id)
        # Order by ID descending for reliable ordering (newest first)
        .order_by(desc(models.NoteVersion.id))
        .offset(skip)
        .limit(limit)
        .all()
    )


def restore_note_version(db: Session, version_id: int) -> Optional[models.Note]:
    """
    Restores a note to the state of a specific version.

    This creates a new version of the current state before restoring.

    Args:
        db: The database session.
        version_id: The ID of the NoteVersion to restore from.

    Returns:
        The updated Note object if successful, None otherwise.
    """
    # Get the note version to restore from
    target_version = (
        db.query(models.NoteVersion).filter(models.NoteVersion.id == version_id).first()
    )
    if not target_version:
        return None  # Version not found

    #  Get the original note
    original_note = crud.get_note(db=db, note_id=target_version.note_id)

    # Create a new version of the *current* state before overwriting
    current_state_version = models.NoteVersion(
        note_id=original_note.id,
        title=original_note.title,
        content=original_note.content,
    )
    db.add(current_state_version)

    # Update the original note with the content from the target version
    original_note.title = target_version.title
    original_note.content = target_version.content

    # Commit changes (saves the new current_state_version
    # AND the updated original_note)
    db.commit()

    # Refresh the original_note instance to get updated state
    db.refresh(original_note)

    return original_note


# We could add other functions here later, like:
# def get_note_version(db: Session, version_id: int) -> Optional[models.NoteVersion]:
#    """Fetches a specific version by its ID."""
#    # Implementation needed
#    pass
