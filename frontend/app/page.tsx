'use client';
// Remove imports no longer directly used in this component
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  // fetchNotes, // Used in useNotesQuery
  Note, // Still needed for typing
  // createNote, // Used in useCreateNoteMutation
  NoteCreatePayload, // Still needed for handler
  // deleteNote, // Used in useDeleteNoteMutation
  // updateNote, // Used in useUpdateNoteMutation
  NoteUpdatePayload, // Still needed for handler
} from '@/lib/api';
import { useEffect } from 'react';
import { useNoteStore } from '@/store/noteStore';
// Import custom hooks
import { useNotesQuery } from '@/hooks/useNotesQuery';
import {
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from '@/hooks/useNoteMutations';

import NoteSidebar from '@/components/notes/NoteSidebar';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteActionBar from '@/components/notes/NoteActionBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
/*
  Home component that displays a list of notes
 */
export default function Home() {
  // Remove useState for Zustand-managed state
  // const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  // const [editedTitle, setEditedTitle] = useState('');
  // const [editedContent, setEditedContent] = useState('');

  // Get state and actions from Zustand store
  const {
    selectedNoteId,
    editedTitle,
    editedContent,
    setSelectedNoteId,
    setEditedTitle,
    setEditedContent,
    setEditorState,
    resetEditorState,
  } = useNoteStore();

  // --- React Query Hook Calls ---
  // No need for queryClient here anymore, it's used inside the custom hooks
  // const queryClient = useQueryClient();

  const { data: notes, isLoading, isError, error } = useNotesQuery();
  const createMutation = useCreateNoteMutation();
  const updateMutation = useUpdateNoteMutation();
  const deleteMutation = useDeleteNoteMutation();
  // --- End React Query Hook Calls ---

  // --- Sélection et État d'édition ---
  // Find selected note, explicitly typing the callback parameter
  const selectedNote = notes?.find((note: Note) => note.id === selectedNoteId);

  // Effect to update the Zustand editor state when the selected note changes
  useEffect(() => {
    if (selectedNote) {
      setEditorState(selectedNote.title, selectedNote.content);
    } else {
      resetEditorState();
    }
  }, [selectedNote, setEditorState, resetEditorState]);

  // Check for changes by comparing Zustand state with React Query data
  const hasChanges =
    selectedNote !== undefined &&
    (editedTitle !== selectedNote.title ||
      editedContent !== selectedNote.content);

  // --- Handlers (Mostly unchanged, but now call custom hook mutations) ---
  const handleSelectNote = async (id: number) => {
    if (selectedNoteId === id) return;

    if (hasChanges && selectedNoteId !== null) {
      if (
        window.confirm(
          'You have unsaved changes. Save before switching?\n(Cancel to discard changes)'
        )
      ) {
        try {
          const payload: NoteUpdatePayload = {
            title: editedTitle,
            content: editedContent,
          };
          // Use the custom hook's mutateAsync
          await updateMutation.mutateAsync({ id: selectedNoteId, payload });
          setSelectedNoteId(id);
        } catch (error) {
          console.error('Failed to save changes before switching:', error);
          alert('Failed to save changes. Please try again.');
        }
      } else {
        setSelectedNoteId(id);
      }
    } else {
      setSelectedNoteId(id);
    }
  };

  const handleCreateNote = () => {
    const defaultNoteData: NoteCreatePayload = {
      title: 'Untitled', // Default title set here
      content: '',
    };
    // Use the custom hook's mutate
    createMutation.mutate(defaultNoteData);
  };

  const handleDeleteNote = (id: number) => {
    // Use the custom hook's mutate
    deleteMutation.mutate(id);
  };

  const handleTitleChange = (newTitle: string) => {
    setEditedTitle(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };

  const handleSaveChanges = () => {
    if (!selectedNoteId || !hasChanges) return;
    const payload: NoteUpdatePayload = {
      title: editedTitle,
      content: editedContent,
    };
    // Use the custom hook's mutate
    updateMutation.mutate({ id: selectedNoteId, payload });
  };
  // --- Fin Handlers ---

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error message if fetch fails
  if (isError)
    return <div>Error fetching notes: {error?.message || 'Unknown error'}</div>;

  // isMutating now correctly reflects the pending state of custom hook mutations
  const isMutating =
    createMutation.isPending ||
    deleteMutation.isPending ||
    updateMutation.isPending;

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-1/5 flex-col border-r border-gray-200">
        <NoteSidebar
          notes={notes ?? []}
          selectedNoteId={selectedNoteId}
          onSelectNote={handleSelectNote}
          isLoading={isLoading}
        />
      </div>
      {/* Editor */}
      <div className="flex flex-1 flex-col">
        <NoteActionBar
          selectedNoteId={selectedNoteId}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          onSaveChanges={handleSaveChanges}
          hasChanges={hasChanges}
          isSaving={updateMutation.isPending} // isSaving still uses the update mutation's pending state
        />
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading || isMutating ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : selectedNoteId !== null ? (
            <NoteEditor
              key={selectedNoteId}
              title={editedTitle}
              content={editedContent}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a note to view or edit, or create a new one.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
