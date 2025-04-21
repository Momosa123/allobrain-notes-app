import { z } from 'zod';

// --- Note Schemas and Types ---

export const NoteSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional().nullable(),
});

export const NotesListSchema = z.array(NoteSchema);

export type Note = z.infer<typeof NoteSchema>;

// --- Note Create Schemas and Types ---

// This is the type of the data sent to the API
const _NoteCreateSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string(),
});

export type NoteCreatePayload = z.infer<typeof _NoteCreateSchema>;

// --- Note Update Schemas and Types ---
// This is the type of the data sent to the API
export const NoteUpdateSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  content: z.string(),
});

// This is the type of the data sent to the API
export type NoteUpdatePayload = z.infer<typeof NoteUpdateSchema>;

// --- Note Version Types ---
// This is the type of the data returned by the API
export interface NoteVersion {
  id: number;
  note_id: number;
  title: string;
  content: string;
  version_timestamp: string;
}

// --- Restore Payload ---
export interface RestorePayload {
  noteId: number | null;
  versionId: number;
}
