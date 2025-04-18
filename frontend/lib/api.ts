import { z } from 'zod';
import axios from 'axios'; // Import axios

// Define the schema for a single Note object
// This ensures type safety and runtime validation of note data
const NoteSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(), // Optional since it may not exist for new notes
});

// Schema for an array of notes returned from the API
const NotesListSchema = z.array(NoteSchema);

// Export the Note type for use in other components
export type Note = z.infer<typeof NoteSchema>;

// Schema for the data to create a note
const _NoteCreateSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string(),
});

// Type inferred for the creation of a note
export type NoteCreatePayload = z.infer<typeof _NoteCreateSchema>;

// Schema for the data to update a note
// We expect a title (string) and a content (string).
export const NoteUpdateSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  content: z.string(), // Can be empty
});

// Type inferred for the update of a note
export type NoteUpdatePayload = z.infer<typeof NoteUpdateSchema>;

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
  // Validation optionnelle côté client avant envoi (bonne pratique)
  try {
    NoteUpdateSchema.parse(payload); // Vérifie que le payload a la bonne structure
  } catch (error) {
    console.error('Invalid update payload:', error);
    // On pourrait rejeter la promesse ou lancer une erreur plus spécifique ici
    // Pour l'instant, on laisse l'API backend valider principalement.
    // throw new Error("Invalid data provided for update.");
  }

  try {
    // Utilisation de l'interpolation pour l'URL
    const response = await apiClient.put<Note>(`/api/v1/notes/${id}`, payload);

    // L'API doit retourner la note mise à jour (avec potentiellement updated_at modifié)
    // Nous validons aussi la réponse avec NoteSchema pour être sûrs
    return NoteSchema.parse(response.data);
  } catch (error) {
    console.error(`Failed to update note ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        throw new Error(`Note with ID ${id} not found.`);
      }
      // Gérer d'autres erreurs HTTP spécifiques si nécessaire
      throw new Error(
        `Failed to update note: ${error.response.statusText || 'Server error'}`
      );
    }
    // Erreur réseau ou autre
    throw new Error('Failed to update note. Please check your connection.');
  }
};
