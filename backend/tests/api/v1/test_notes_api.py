from fastapi.testclient import TestClient


def test_create_note(client: TestClient):
    """Tests successful note creation via POST endpoint."""
    note_data = {"title": "Test Note Title", "content": "Test Note Content"}
    response = client.post("/api/v1/notes/", json=note_data)

    # Verify status code
    assert (
        response.status_code == 201
    ), f"Expected 201, got {response.status_code}. Response: {response.text}"

    # Verify response content
    data = response.json()
    assert data["title"] == note_data["title"]
    assert data["content"] == note_data["content"]
    assert "id" in data  # Verify ID was assigned


# --- Read Tests ---


def test_read_notes(client: TestClient):
    """Test reading a list of notes."""

    #  Create a note first to ensure there is data
    note_data = {"title": "Note 1", "content": "Content 1"}
    client.post("/api/v1/notes/", json=note_data)

    #  Get the list of notes
    response = client.get("/api/v1/notes/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0  # Should have at least the note we created
    assert data[0]["title"] == note_data["title"]


def test_read_note(client: TestClient):
    """Test reading a specific note by ID."""
    #  Create a note
    note_data = {"title": "Readable Note", "content": "Content to read"}
    create_response = client.post("/api/v1/notes/", json=note_data)
    assert create_response.status_code == 201
    note_id = create_response.json()["id"]

    #  Read the created note
    response = client.get(f"/api/v1/notes/{note_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == note_id
    assert data["title"] == note_data["title"]
    assert data["content"] == note_data["content"]


def test_read_nonexistent_note(client: TestClient):
    """Test reading a note that does not exist returns 404."""
    response = client.get("/api/v1/notes/99999")  # Use an unlikely ID
    assert response.status_code == 404


# --- Update Tests ---


def test_update_note(client: TestClient):
    """Test updating an existing note."""
    # Create a note
    note_data = {"title": "Update Me", "content": "Initial Content"}
    create_response = client.post("/api/v1/notes/", json=note_data)
    assert create_response.status_code == 201
    note_id = create_response.json()["id"]

    # Update the note
    update_data = {"title": "Updated Title", "content": "Updated Content"}
    response = client.put(f"/api/v1/notes/{note_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == note_id
    assert data["title"] == update_data["title"]
    assert data["content"] == update_data["content"]


def test_update_nonexistent_note(client: TestClient):
    """Test updating a note that does not exist returns 404."""
    update_data = {"title": "Won't Update", "content": "No Note Here"}
    response = client.put("/api/v1/notes/99999", json=update_data)
    assert response.status_code == 404


# --- Delete Tests ---


def test_delete_note(client: TestClient):
    """Test deleting an existing note."""
    # Create a note
    note_data = {"title": "Delete Me", "content": "Temporary Content"}
    create_response = client.post("/api/v1/notes/", json=note_data)
    assert create_response.status_code == 201
    note_id = create_response.json()["id"]

    # Delete the note
    response = client.delete(f"/api/v1/notes/{note_id}")
    assert response.status_code == 204  # No content on successful delete

    # Verify deletion by trying to read it again
    read_response = client.get(f"/api/v1/notes/{note_id}")
    assert read_response.status_code == 404


def test_delete_nonexistent_note(client: TestClient):
    """Test deleting a note that does not exist returns 404."""
    response = client.delete("/api/v1/notes/99999")
    assert response.status_code == 404
