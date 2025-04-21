import { useMemo, useCallback, useEffect } from 'react';
import { useNoteStore } from '@/store/noteStore';
import { useNotesQuery } from './useNotesQuery';
import {
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from './useNoteMutations';
import { useRestoreNoteVersionMutation } from './useVersionMutations';
import {
  Note,
  NoteCreatePayload,
  NoteUpdatePayload,
} from '@/lib/types/noteTypes';
import { toast } from 'sonner';

/**
 * Custom hook to manage the note state and actions.
 * @returns The result object from useNoteManager (data, isLoading, isError, error,
 * selectedNote, selectedNoteId, hasChanges, isMutating, title, content, selectNote,
 * createNote, saveNote, deleteNote, restoreNoteVersion, onTitleChange, onContentChange)
 */
export function useNoteManager() {
  // Zustand State & Actions
  const {
    selectedNoteId,
    setSelectedNoteId,
    editedTitle,
    editedContent,
    setEditorState,
    resetEditorState,
    setEditedTitle,
    setEditedContent,
  } = useNoteStore();

  // React Query Hooks
  const notesQuery = useNotesQuery();
  const createMutation = useCreateNoteMutation();
  const updateMutation = useUpdateNoteMutation();
  const deleteMutation = useDeleteNoteMutation();
  const restoreMutation = useRestoreNoteVersionMutation();

  // Derived State: Find the selected note object
  const selectedNote = useMemo<Note | undefined>(() => {
    // Ensure notesQuery.data is not undefined before calling find
    return notesQuery.data?.find((note: Note) => note.id === selectedNoteId);
  }, [notesQuery.data, selectedNoteId]);

  // Derived State: Check for unsaved changes
  const hasChanges = useMemo<boolean>(() => {
    if (!selectedNote) {
      return false; // No selected note, no changes
    }
    return (
      editedTitle !== selectedNote.title ||
      editedContent !== selectedNote.content
    );
  }, [selectedNote, editedTitle, editedContent]);

  // State for mutations
  const isMutating =
    createMutation.isPending ||
    deleteMutation.isPending ||
    updateMutation.isPending ||
    restoreMutation.isPending;

  // Effect to sync Zustand editor state with selected note
  useEffect(() => {
    if (selectedNote) {
      // Update Zustand with the selected note's actual content
      setEditorState(selectedNote.title, selectedNote.content);
    } else {
      // No note selected, reset Zustand editor state
      resetEditorState();
    }
    // Dependencies: run when selectedNote changes, or when state setters change
  }, [selectedNote, setEditorState, resetEditorState]);

  // --- Actions / Handlers ---

  const createNote = useCallback(() => {
    const defaultNoteData: NoteCreatePayload = {
      title: 'Untitled',
      content: '',
    };
    createMutation.mutate(defaultNoteData);
  }, [createMutation]);

  const deleteNote = useCallback(
    (id: number) => {
      deleteMutation.mutate(id);

      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const saveNote = useCallback(async (): Promise<Note> => {
    if (!selectedNoteId || !hasChanges) {
      throw new Error('No changes to save or no note selected.');
    }
    const payload: NoteUpdatePayload = {
      title: editedTitle,
      content: editedContent,
    };
    // Uses mutateAsync and returns the promise
    return updateMutation.mutateAsync({ id: selectedNoteId, payload });
  }, [selectedNoteId, hasChanges, editedTitle, editedContent, updateMutation]);

  const selectNote = setSelectedNoteId;

  // --- Restore Handler (moved from page.tsx) ---
  const restoreNoteVersion = useCallback(
    (versionId: number) => {
      if (!selectedNoteId) {
        console.error('Cannot restore version, no note selected in manager.');
        toast.error('Impossible de restaurer : aucune note sélectionnée.');
        return;
      }
      restoreMutation.mutate({ noteId: selectedNoteId, versionId });
    },
    [selectedNoteId, restoreMutation]
  );

  // Initial Return Object
  return {
    // --- Data & State ---
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    isError: notesQuery.isError,
    error: notesQuery.error,
    selectedNote: selectedNote,
    selectedNoteId: selectedNoteId,
    hasChanges: hasChanges,
    isMutating: isMutating,

    // --- Editor State    ---
    title: editedTitle,
    content: editedContent,

    // --- Actions ---
    selectNote: selectNote,
    createNote: createNote,
    saveNote: saveNote,
    deleteNote: deleteNote,
    restoreNoteVersion: restoreNoteVersion,
    onTitleChange: setEditedTitle,
    onContentChange: setEditedContent,
  };
}
