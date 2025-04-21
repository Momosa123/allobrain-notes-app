import { z } from 'zod';
import axios from 'axios'; // Import axios
// Import types and schemas from the new file
import {
  Note,
  NotesListSchema,
  NoteSchema,
  NoteCreatePayload,
  // _NoteCreateSchema, // No need to import if internal
  NoteUpdatePayload,
  NoteUpdateSchema,
  NoteVersion,
  RestorePayload,
} from './types/noteTypes';

// Create an axios instance with the base URL
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches all notes from the backend API
 * @returns Promise containing an array of validated Note objects
 * @throws Error if the fetch fails or if the response data is invalid
 */
export async function fetchNotes(): Promise<Note[]> {
  try {
    // Use the apiClient instance to make the GET request
    const response = await apiClient.get('/api/v1/notes/');

    // With axios, the data is directly in response.data
    const data = response.data;

    // Validate the received data with Zod (unchanged)
    const validationResult = NotesListSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(
        `Invalid data structure received from API: ${validationResult.error.message}`
      );
    }

    return validationResult.data;
  } catch (error) {
    // Handle Axios errors  or Zod validation errors
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch notes: ${error.response?.statusText || error.message} (${error.response?.status ?? 'Network Error'})`
      );
    } else if (error instanceof Error) {
      // Handle Zod validation errors or other JS errors
      throw error;
    } else {
      // Handle unknown errors
      throw new Error('An unknown error occurred while fetching notes.');
    }
  }
}

/**
 * Creates a new note via the backend API.
 * @param noteData The data for the new note (title, content).
 * @returns Promise containing the created and validated Note object.
 * @throws Error if the request fails or the response data is invalid.
 */
export async function createNote(noteData: NoteCreatePayload): Promise<Note> {
  try {
    const response = await apiClient.post('/api/v1/notes/', noteData);
    const validationResult = NoteSchema.safeParse(response.data);

    if (!validationResult.success) {
      throw new Error(
        `Invalid data structure received after creating note: ${validationResult.error.message}`
      );
    }
    return validationResult.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const detail = error.response?.data?.detail || error.message;
      throw new Error(
        `Failed to create note: ${error.response?.statusText || 'Server error'} (${error.response?.status ?? 'Network Error'}) - ${detail}`
      );
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred while creating the note.');
    }
  }
}

/**
 * Deletes a note via the backend API.
 * @param noteId The ID of the note to delete.
 * @returns Promise<void>
 * @throws Error if the request fails.
 */
export async function deleteNote(noteId: number): Promise<void> {
  try {
    const response = await apiClient.delete(`/api/v1/notes/${noteId}`);

    // Wait for a 204 No Content status for a successful deletion
    if (response.status !== 204) {
      throw new Error(
        `Unexpected status code after delete: ${response.status}`
      );
    }
    // No content to return or validate for a 204
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const detail = error.response?.data?.detail || error.message;
      if (error.response?.status === 404) {
        throw new Error(`Note with ID ${noteId} not found.`);
      }
      throw new Error(
        `Failed to delete note: ${error.response?.statusText || 'Server error'} (${error.response?.status ?? 'Network Error'}) - ${detail}`
      );
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred while deleting the note.');
    }
  }
}

/**
 * Updates an existing note.
 * @param id The ID of the note to update.
 * @param payload The data to update (title, content).
 * @returns The updated note data.
 * @throws If the note is not found (404) or on other server errors.
 */
export const updateNote = async ({
  id,
  payload,
}: {
  id: number;
  payload: NoteUpdatePayload;
}): Promise<Note> => {
  // Optional client-side validation before sending (good practice)
  try {
    NoteUpdateSchema.parse(payload); // Check that the payload has the correct structure
  } catch (error) {
    console.error('Invalid update payload:', error);
    // We throw an error to stop the update
    throw new Error('Invalid data provided for update.');
  }

  try {
    const response = await apiClient.put<Note>(`/api/v1/notes/${id}`, payload);

    // The API must return the updated note (with potentially updated_at modified)
    // We also validate the response with NoteSchema to be sure
    return NoteSchema.parse(response.data);
  } catch (error) {
    console.error(`Failed to update note ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        throw new Error(`Note with ID ${id} not found.`);
      }
      // Handle other specific HTTP errors if necessary
      throw new Error(
        `Failed to update note: ${error.response.statusText || 'Server error'}`
      );
    }
    // Network error or other
    throw new Error('Failed to update note. Please check your connection.');
  }
};

// --- Versioning API Functions ---

/**
 * Fetches all versions of a note from the backend API.
 * @param noteId - The ID of the note to fetch versions for.
 * @returns A promise that resolves to an array of NoteVersion objects.
 * @throws An error if the request fails or the response data is invalid.
 */
export const getNoteVersions = async (
  noteId: number
): Promise<NoteVersion[]> => {
  try {
    const response = await apiClient.get(`/api/v1/notes/${noteId}/versions/`);
    // Add basic validation if needed, e.g., check if response.data is an array
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid data structure for versions received from API');
    }
    // Assuming backend sends data matching NoteVersion interface
    return response.data as NoteVersion[];
  } catch (error) {
    console.error(`Failed to fetch versions for note ${noteId}:`, error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch versions: ${error.response?.statusText || error.message} (${error.response?.status ?? 'Network Error'})`
      );
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred while fetching versions.');
    }
  }
};

/**
 * Restores a note version.
 * @param payload - The payload containing the note ID and version ID.
 * @returns A promise that resolves to the updated Note object.
 * @throws An error if the request fails or the response data is invalid.
 */
export const restoreNoteVersion = async ({
  noteId,
  versionId,
}: RestorePayload): Promise<Note> => {
  if (!noteId) {
    throw new Error('Cannot restore version without a selected note ID.');
  }
  try {
    const response = await apiClient.post(
      `/api/v1/notes/${noteId}/versions/${versionId}/restore/`
    );
    console.log('Restore response:', response.data);
    // Validate response using NoteSchema
    const validationResult = NoteSchema.safeParse(response.data);
    if (!validationResult.success) {
      throw new Error(
        `Invalid data structure received after restoring version: ${validationResult.error.message}`
      );
    }
    return validationResult.data;
  } catch (error) {
    console.error(
      `Failed to restore version ${versionId} for note ${noteId}:`,
      error
    );
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Version or Note not found.`);
      }
      if (error.response?.status === 400) {
        throw new Error(`Version does not belong to the specified note.`);
      }
      throw new Error(
        `Failed to restore version: ${error.response?.statusText || error.message} (${error.response?.status ?? 'Network Error'})`
      );
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred while restoring version.');
    }
  }
};
