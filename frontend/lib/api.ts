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

// Schéma Zod pour les données de création d'une note
const NoteCreateSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string(),
});

// Type inféré pour la création
export type NoteCreatePayload = z.infer<typeof NoteCreateSchema>;

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
      console.error(
        'API response validation failed:',
        validationResult.error.flatten()
      );
      // Throw a more descriptive error for validation failure
      throw new Error(
        `Invalid data structure received from API: ${validationResult.error.message}`
      );
    }

    return validationResult.data;
  } catch (error) {
    // Handle Axios errors (network, 4xx, 5xx) or Zod validation errors
    if (axios.isAxiosError(error)) {
      console.error(
        'Axios error fetching notes:',
        error.response?.status,
        error.message
      );
      throw new Error(
        `Failed to fetch notes: ${error.response?.statusText || error.message} (${error.response?.status ?? 'Network Error'})`
      );
    } else if (error instanceof Error) {
      // Handle Zod validation errors or other JS errors
      console.error('Error fetching notes:', error.message);
      throw error; // Rethrow the error (will be caught by useQuery)
    } else {
      // Handle unknown errors
      console.error('Unknown error fetching notes:', error);
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
      console.error(
        'Create note API response validation failed:',
        validationResult.error.flatten()
      );
      throw new Error(
        `Invalid data structure received after creating note: ${validationResult.error.message}`
      );
    }
    return validationResult.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Axios error creating note:',
        error.response?.status,
        error.message
      );
      const detail = error.response?.data?.detail || error.message;
      throw new Error(
        `Failed to create note: ${error.response?.statusText || 'Server error'} (${error.response?.status ?? 'Network Error'}) - ${detail}`
      );
    } else if (error instanceof Error) {
      console.error('Error creating note:', error.message);
      throw error;
    } else {
      console.error('Unknown error creating note:', error);
      throw new Error('An unknown error occurred while creating the note.');
    }
  }
}
