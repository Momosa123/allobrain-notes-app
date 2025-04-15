from typing import List, Optional

from sqlalchemy.orm import Session

from .. import models, schemas


# READ
def get_note(db: Session, note_id: int) -> Optional[models.Note]:
    """
    Fetches note by its ID.

    Args:
        db: The database session
        note_id: The ID of the note to retrieve

    Returns:
        The SQLAlchemy Note model instance if found, otherwise None.
    """
    return db.query(models.Note).filter(models.Note.id == note_id).first()


def get_notes(db: Session, skip: int = 0, limit: int = 10) -> List[models.Note]:
    """
    Fetches all  notes.

    Args:
        db: The database session
        skip: The number of notes to be skipped
        limit: Maximum number of notes to be fetched

    Returns:
        A list of SQLAlchemy Note model instances.
    """
    return db.query(models.Note).offset(skip).limit(limit).all()


# CREATE
def create_note(db: Session, note: schemas.NoteCreate) -> models.Note:
    """
    Creates a  note.

    Args:
        db: The database session
        note: Pydantic schema containing data for the new note

    Returns:
        The SQLAlchemy Note model instance of the created note
    """

    db_note = models.Note(title=note.title, content=note.content)

    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


# UPDATE
def update_note(
    db: Session, note_id: int, note_update: schemas.NoteUpdate
) -> Optional[models.Note]:
    """
    Updates a  note.

    Args:
        db: The database session
        note_id: The id of the updated note
        note_update: Pydantic schema with fields to update

    Returns:
        The SQLAlchemy Note model instance of the update note
        or None if no note is found.
    """
    db_note = get_note(db, note_id=note_id)
    if not db_note:
        return None

    # Takes the Pydantic schema fields excluding the ones that are  undefined
    update_data = note_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_note, key, value)

    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


# DELETE
def delete_note(db: Session, note_id: int) -> Optional[models.Note]:
    """
    Deletes a  note.

    Args:
        db: The database session
        note_id: The id of the note to be deleted

    Returns:
        The SQLAlchemy Note model instance of the deleted note
        or None if no note is found.
    """

    db_note = get_note(db, note_id=note_id)
    if not db_note:
        return None

    db.delete(db_note)
    db.commit()

    return db_note
