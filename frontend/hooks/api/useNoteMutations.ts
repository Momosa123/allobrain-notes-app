import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote, updateNote, deleteNote } from '@/lib/api';
import {
  Note,
  NoteCreatePayload,
  NoteUpdatePayload,
} from '@/lib/types/noteTypes';
import { useNoteStore } from '@/store/noteStore';
import { toast } from 'sonner';

/**
 * Custom hook to create a new note using React Query.
 * Encapsulates the mutation function and success/error handlers.
 * @returns The result object from useMutation (data, isPending, isError, error, etc.)
 */
export function useCreateNoteMutation() {
  const queryClient = useQueryClient();
  const { setSelectedNoteId, setEditorState } = useNoteStore();

  return useMutation<Note, Error, NoteCreatePayload>({
    mutationFn: createNote,
    onSuccess: (newlyCreatedNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNoteId(newlyCreatedNote.id);
      setEditorState(newlyCreatedNote.title, newlyCreatedNote.content);
      toast.success('Note créée avec succès !');
    },
    onError: (error) => {
      console.error('Failed to create note:', error);
      toast.error('Erreur lors de la création de la note.');
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
      setEditorState(updatedNote.title, updatedNote.content);
      toast.success('Note enregistrée avec succès !');
    },
    onError: (error) => {
      console.error('Failed to update note:', error);
      toast.error("Erreur lors de l'enregistrement de la note.");
    },
  });
}

// --- Hook for Deleting Notes ---
export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();
  const { setSelectedNoteId, resetEditorState } = useNoteStore();

  return useMutation<void, Error, number>({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNoteId(null);
      resetEditorState();
      toast.success('Note supprimée avec succès !');
    },
    onError: (error) => {
      console.error('Failed to delete note:', error);
      toast.error('Erreur lors de la suppression de la note.');
    },
  });
}
