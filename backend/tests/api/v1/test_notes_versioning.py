from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# --- Tests ---


# --- Test that updating a note correctly creates
# a version with the previous content. ---
def test_update_note_creates_version(client: TestClient):
    """Test that updating a note correctly creates
    a version with the previous content."""
    # 1. Create a note
    initial_data = {"title": "Initial Title", "content": "Initial Content"}
    response_create = client.post("/api/v1/notes/", json=initial_data)
    assert response_create.status_code == 201
    created_note = response_create.json()
    note_id = created_note["id"]

    # 2. Update the note
    update_data = {"title": "Updated Title", "content": "Updated Content"}
    response_update = client.put(f"/api/v1/notes/{note_id}", json=update_data)
    assert response_update.status_code == 200

    # 3. Get versions for the note
    response_versions = client.get(f"/api/v1/notes/{note_id}/versions/")
    assert response_versions.status_code == 200
    versions = response_versions.json()

    # 4. Assert that one version exists
    assert len(versions) == 1
    note_version = versions[0]

    # 5. Assert that the version content matches the *original* note content
    assert note_version["title"] == initial_data["title"]
    assert note_version["content"] == initial_data["content"]
    assert note_version["note_id"] == note_id
    assert "id" in note_version  # Version should have its own ID
    assert "version_timestamp" in note_version


# --- Test that retrieving versions for a note works correctly. ---
def test_get_note_versions(client: TestClient):
    """Test retrieving versions for a note, checking order and content."""
    # 1. Create a note
    initial_data = {"title": "Initial Title", "content": "Initial Content"}
    response_create = client.post("/api/v1/notes/", json=initial_data)
    assert response_create.status_code == 201
    created_note = response_create.json()
    note_id = created_note["id"]

    # 2. Update the note (creates version 1 with initial_data content)
    update_data_1 = {"title": "Update 1", "content": "Content 1"}
    response_update_1 = client.put(f"/api/v1/notes/{note_id}", json=update_data_1)
    assert response_update_1.status_code == 200

    # 3. Update the note again (creates version 2 with update_data_1 content)
    update_data_2 = {"title": "Update 2", "content": "Content 2"}
    response_update_2 = client.put(f"/api/v1/notes/{note_id}", json=update_data_2)
    assert response_update_2.status_code == 200

    # 4. Get versions for the note via API (Correct Endpoint)
    response_versions = client.get(f"/api/v1/notes/{note_id}/versions/")
    assert response_versions.status_code == 200
    versions = response_versions.json()

    # 5. Assert that 2 versions are returned
    assert len(versions) == 2

    # 6. Assert they are ordered correctly (newest first)
    version_newest = versions[0]
    version_older = versions[1]

    # 7. Assert their content matches the expected previous states
    assert version_newest["title"] == update_data_1["title"]
    assert version_newest["content"] == update_data_1["content"]
    assert version_newest["note_id"] == note_id

    # Older version (index 1) should contain the state
    # BEFORE the first update (i.e., initial_data)
    assert version_older["title"] == initial_data["title"]
    assert version_older["content"] == initial_data["content"]
    assert version_older["note_id"] == note_id


# --- Test that restoring a note to a previous version works correctly. ---
def test_restore_note_version(client: TestClient):
    """Test restoring a note to a previous version."""
    # 1. Create a note (state A)
    state_a_data = {"title": "State A Title", "content": "State A Content"}
    response_create = client.post("/api/v1/notes/", json=state_a_data)
    assert response_create.status_code == 201
    note_id = response_create.json()["id"]

    # 2. Update the note (state B, version A created)
    state_b_data = {"title": "State B Title", "content": "State B Content"}
    response_update_1 = client.put(f"/api/v1/notes/{note_id}", json=state_b_data)
    assert response_update_1.status_code == 200

    # 3. Update the note again (state C, version B created)
    state_c_data = {"title": "State C Title", "content": "State C Content"}
    response_update_2 = client.put(f"/api/v1/notes/{note_id}", json=state_c_data)
    assert response_update_2.status_code == 200

    # 4. Get versions and find the ID of version A (which has state A content)
    response_get_versions_before = client.get(f"/api/v1/notes/{note_id}/versions/")
    assert response_get_versions_before.status_code == 200
    versions_before = response_get_versions_before.json()
    assert len(versions_before) == 2
    # Version A is the older one (index 1 because newest first)
    version_a = versions_before[1]
    assert version_a["title"] == state_a_data["title"]
    version_a_id = version_a["id"]

    # 5. Restore Version A
    response_restore = client.post(
        f"/api/v1/notes/{note_id}/versions/{version_a_id}/restore/"
    )
    assert response_restore.status_code == 200

    # 6. Assert the response (updated note) has content of state A
    restored_note_data = response_restore.json()
    assert restored_note_data["title"] == state_a_data["title"]
    assert restored_note_data["content"] == state_a_data["content"]
    assert restored_note_data["id"] == note_id

    # 7. Get the note directly - Assert it has content of state A
    response_get_note_after = client.get(f"/api/v1/notes/{note_id}")
    assert response_get_note_after.status_code == 200
    note_after_data = response_get_note_after.json()
    assert note_after_data["title"] == state_a_data["title"]
    assert note_after_data["content"] == state_a_data["content"]

    # 8. Get versions - Assert there are 3 versions
    response_get_versions_after = client.get(f"/api/v1/notes/{note_id}/versions/")
    assert response_get_versions_after.status_code == 200
    versions_after = response_get_versions_after.json()
    assert len(versions_after) == 3

    # 9. Assert the newest version (version C - created during restore) contains state C
    version_c = versions_after[0]  # Newest is at index 0
    assert version_c["title"] == state_c_data["title"]
    assert version_c["content"] == state_c_data["content"]

    # 10. Check other versions are still there
    version_b_check = versions_after[1]
    version_a_check = versions_after[2]
    assert version_b_check["title"] == state_b_data["title"]
    assert version_a_check["title"] == state_a_data["title"]


def test_delete_note_cascades_to_versions(db_session: Session, client: TestClient):
    """Test that deleting a note also deletes its associated versions due to CASCADE."""
    # 1. Create a note
    initial_data = {"title": "Note to Delete", "content": "Content to delete"}
    response_create = client.post("/api/v1/notes/", json=initial_data)
    assert response_create.status_code == 201
    note_id = response_create.json()["id"]

    # 2. Update the note (create a version)
    update_data = {
        "title": "Updated Before Delete",
        "content": "New Content Before Delete",
    }
    response_update = client.put(f"/api/v1/notes/{note_id}", json=update_data)
    assert response_update.status_code == 200

    # 3. Get the version ID
    response_get_versions = client.get(f"/api/v1/notes/{note_id}/versions/")
    assert response_get_versions.status_code == 200
    versions = response_get_versions.json()
    assert len(versions) == 1
    version_id = versions[0]["id"]

    # 4. Delete the note via API
    response_delete = client.delete(f"/api/v1/notes/{note_id}")
    assert response_delete.status_code == 204

    # 5. Assert the note is deleted (GET returns 404)
    response_get_note = client.get(f"/api/v1/notes/{note_id}")
    assert response_get_note.status_code == 404

    # 6. Assert getting versions for the deleted note returns an empty list
    response_get_versions_after = client.get(f"/api/v1/notes/{note_id}/versions/")
    assert (
        response_get_versions_after.status_code == 200
    )  # Endpoint doesn't check parent note
    assert response_get_versions_after.json() == []

    # 7. Try to query the version directly from DB - Assert it's gone

    from app.models import NoteVersion

    db_version = (
        db_session.query(NoteVersion).filter(NoteVersion.id == version_id).first()
    )
    assert db_version is None
