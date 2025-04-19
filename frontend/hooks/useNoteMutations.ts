import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createNote,
  updateNote,
  deleteNote,
  Note,
  NoteCreatePayload,
  NoteUpdatePayload,
} from '@/lib/api';
import { useNoteStore } from '@/store/noteStore';

// --- Hook for Creating Notes ---
export function useCreateNoteMutation() {
  const queryClient = useQueryClient();
  const { setSelectedNoteId, setEditorState } = useNoteStore();

  return useMutation<Note, Error, NoteCreatePayload>({
    mutationFn: createNote,
    onSuccess: (newlyCreatedNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNoteId(newlyCreatedNote.id);
      setEditorState(newlyCreatedNote.title, newlyCreatedNote.content);
    },
    onError: (error) => {
      console.error('Failed to create note:', error);
      // TODO: Add user-facing error notification
    },
  });
}

// --- Hook for Updating Notes ---
export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();
  const { setEditorState } = useNoteStore();

  return useMutation<Note, Error, { id: number; payload: NoteUpdatePayload }>({
    mutationFn: updateNote,
    onSuccess: (updatedNote) => {
      // Optimistic update in React Query cache
      queryClient.setQueryData(['notes'], (oldData: Note[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(
          (
            note: Note // Ensure 'note' is typed
          ) => (note.id === updatedNote.id ? updatedNote : note)
        );
      });
      console.log('Note updated successfully!');
      // Update Zustand state to match saved state
      setEditorState(updatedNote.title, updatedNote.content);
    },
    onError: (error) => {
      console.error('Failed to update note:', error);
      // TODO: Add user-facing error notification
    },
  });
}

// --- Hook for Deleting Notes ---
export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();
  const { setSelectedNoteId, resetEditorState } = useNoteStore();

  return useMutation<void, Error, number>({
    // Types: Response (void), Error, Payload (id)
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNoteId(null);
      resetEditorState();
    },
    onError: (error) => {
      console.error('Failed to delete note:', error);
      // TODO: Add user-facing error notification
    },
  });
}
