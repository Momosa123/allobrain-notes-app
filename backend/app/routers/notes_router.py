from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..db.session import get_db

# Notes router

router = APIRouter(prefix="/api/v1/notes", tags=["Notes"])


# Endpoint to create a Note
@router.post("/", response_model=schemas.Note, status_code=status.HTTP_201_CREATED)
def create_note_endpoint(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    """
    Create a new note.
    Takes the note data (NoteCreate schema) in the body of the request.
    Returns the created Note (schema Note) with status 201
    """
    return crud.create_note(db=db, note=note)


# Endpoint to read all notes
@router.get("/", response_model=List[schemas.Note])
def read_notes_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Gets a list of notes with pagination by default.
    Takes parameters skip and limit
    Returns a list of notes (schema Note)
    """
    notes = crud.get_notes(db=db, skip=skip, limit=limit)
    return notes


# Endpoint to read a specific note
@router.get("/{note_id}", response_model=schemas.Note)
def read_note_endpoint(note_id: int, db: Session = Depends(get_db)):
    """
    Get a note based on its ID
    Returns the found note (Note schema) or 404 error
    """

    db_note = crud.get_note(db=db, note_id=note_id)
    if db_note is None:
        # Raise HTTP exception if no note is found
        raise HTTPException(status_code=404, detail="Note not found on update")
    return db_note


# Endpoint to update a note
@router.put("/{note_id}", response_model=schemas.Note)
def update_note_endpoint(
    note_id: int, note: schemas.NoteUpdate, db: Session = Depends(get_db)
):
    """
    Updates a note based on its ID
    Returns the updated note
    """
    updated_note = crud.update_note(db=db, note_id=note_id, note_update=note)
    if updated_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return updated_note


# Endpoint to delete a note
@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note_endpoint(note_id: int, db: Session = Depends(get_db)):
    """
    Deletes a note based on its ID
    Returns status 204 No content if success and 404 if there is an error
    """
    deleted_note = crud.delete_note(db, note_id=note_id)
    if deleted_note is None:
        raise HTTPException(status_code=404, detail="Note not found on delete")
    return None


# Endpoint to get versions for a specific note
@router.get("/{note_id}/versions/", response_model=List[schemas.NoteVersion])
def read_note_versions_endpoint(
    note_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """
    Gets a list of versions for a specific note, ordered from newest to oldest.
    Takes path parameter note_id and query parameters skip and limit.
    Returns a list of note versions (schema NoteVersion).
    """

    versions = crud.get_note_versions(db=db, note_id=note_id, skip=skip, limit=limit)

    return versions


# Endpoint to restore a note to a specific version
@router.post(
    "/{note_id}/versions/{version_id}/restore/",
    response_model=schemas.Note,  # Returns the updated note
)
def restore_note_version_endpoint(
    note_id: int,  # Included for clarity in the path
    version_id: int,
    db: Session = Depends(get_db),
):
    """
    Restores a note to the state of a specific version.
    Creates a new version of the current state before restoring.
    Returns the updated Note.
    """
    # We pass version_id to the CRUD function.
    # note_id is implicitly checked because the version belongs to a note.
    restored_note = crud.restore_note_version(db=db, version_id=version_id)

    if restored_note is None:
        # This could mean the version_id was invalid
        raise HTTPException(
            status_code=404, detail="Version or original note not found"
        )

    # Ensure the restored note actually matches the note_id from the path
    if restored_note.id != note_id:
        raise HTTPException(
            status_code=400, detail="Version does not belong to the specified note"
        )

    return restored_note
