'use client';

import { Note, NoteCreatePayload, NoteUpdatePayload } from '@/lib/api';
import { useEffect, useState, useCallback } from 'react';
import { useNoteStore } from '@/store/noteStore';
// Import custom hooks
import { useNotesQuery } from '@/hooks/useNotesQuery';
import {
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from '@/hooks/useNoteMutations';
import { useRestoreNoteVersionMutation } from '@/hooks/useVersionMutations';
import { useNoteVersionsQuery } from '@/hooks/useNoteVersionsQuery';
import { toast } from 'sonner';
import VersionHistoryPanel from '@/components/notes/VersionHistoryPanel';

import NoteSidebar from '@/components/notes/NoteSidebar';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteActionBar from '@/components/notes/NoteActionBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
/*
  Home component that displays a list of notes
 */
export default function Home() {
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

  // --- Local UI State for Panel ---
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const { data: notes, isLoading, isError, error } = useNotesQuery();
  const createMutation = useCreateNoteMutation();
  const updateMutation = useUpdateNoteMutation();
  const deleteMutation = useDeleteNoteMutation();
  const restoreMutation = useRestoreNoteVersionMutation(); // Instantiate the new hook

  // --- Query for Note Versions (Using Custom Hook) ---
  const {
    // Rename destructured variables for clarity
    data: versionsData, // Array of NoteVersion
    isLoading: isVersionsLoading,
    isError: isVersionsError,
  } = useNoteVersionsQuery(selectedNoteId, isHistoryPanelOpen);

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
          setIsHistoryPanelOpen(false);
        } catch (error) {
          console.error('Failed to save changes before switching:', error);
          alert('Failed to save changes. Please try again.');
        }
      } else {
        setSelectedNoteId(id);
        setIsHistoryPanelOpen(false);
      }
    } else {
      setSelectedNoteId(id);
      setIsHistoryPanelOpen(false);
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

  // --- Panel Handlers  ---
  const openHistoryPanel = useCallback(() => {
    if (selectedNoteId) {
      setIsHistoryPanelOpen(true);
    }
  }, [selectedNoteId]);

  const closeHistoryPanel = useCallback(() => {
    setIsHistoryPanelOpen(false);
  }, []);

  // --- Placeholder Restore Handler  ---
  const handleRestoreVersion = useCallback(
    (versionId: number) => {
      if (!selectedNoteId) {
        console.error('Cannot restore version, no note selected.');
        toast.error('Veuillez sélectionner une note avant de restaurer.');
        return;
      }

      // Call the mutation
      restoreMutation.mutate(
        { noteId: selectedNoteId, versionId },
        {
          onSuccess: () => {
            // Close the panel on successful restoration
            closeHistoryPanel();
          },
        }
      );
    },
    [selectedNoteId, restoreMutation, closeHistoryPanel]
  );

  // --- Loading/Error/Render Logic  ---
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
    updateMutation.isPending ||
    restoreMutation.isPending; // Include restore mutation state

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
          isSaving={updateMutation.isPending}
          onShowHistory={openHistoryPanel}
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

      {/* Render the Version History Panel */}
      <VersionHistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={closeHistoryPanel}
        versions={versionsData}
        isLoading={isVersionsLoading}
        isError={isVersionsError}
        onRestore={handleRestoreVersion}
      />
    </main>
  );
}
