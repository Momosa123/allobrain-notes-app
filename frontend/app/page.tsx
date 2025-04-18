'use client';
// Import necessary dependencies for data fetching and types
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotes,
  Note,
  createNote,
  NoteCreatePayload,
  deleteNote,
  updateNote,
  NoteUpdatePayload,
} from '@/lib/api';
import { useState, useEffect } from 'react';
import NoteSidebar from '@/components/notes/NoteSidebar';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteActionBar from '@/components/notes/NoteActionBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
/*
  Home component that displays a list of notes
 */
export default function Home() {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // --- Local state for editing ---
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  // Fetch Notes using React Query hook
  const {
    data: notes,
    isError,
    isLoading,
    error,
  } = useQuery<Note[], Error>({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  // --- Mutations (Create, Delete) ---
  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newlyCreatedNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNoteId(newlyCreatedNote.id);
      // Mettre à jour l'état édité aussi lors de la création
      setEditedTitle(newlyCreatedNote.title);
      setEditedContent(newlyCreatedNote.content);
    },
    onError: (error) => {
      console.error('Failed to create note:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNoteId(null);
      // Nettoyer l'état édité lors de la suppression
      setEditedTitle('');
      setEditedContent('');
    },
    onError: (error) => {
      console.error('Failed to delete note:', error);
    },
  });
  // --- Fin Mutations (Create, Delete) ---

  // --- Mutation pour la Mise à Jour ---
  const updateMutation = useMutation({
    mutationFn: updateNote,
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(['notes'], (oldData: Note[] | undefined) => {
        if (!oldData) return [];
        return oldData.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        );
      });
      console.log('Note updated successfully!');
      // S'assurer que l'état édité reflète la sauvegarde
      setEditedTitle(updatedNote.title);
      setEditedContent(updatedNote.content);
    },
    onError: (error) => {
      console.error('Failed to update note:', error);
    },
  });
  // --- Fin Mutation Mise à Jour ---

  // --- Sélection et État d'édition ---
  const selectedNote = notes?.find((note) => note.id === selectedNoteId);

  // --- Effect to update the edited title and content when the selected note changes ---
  useEffect(() => {
    if (selectedNote) {
      setEditedTitle(selectedNote.title);
      setEditedContent(selectedNote.content);
    } else {
      setEditedTitle('');
      setEditedContent('');
    }
  }, [selectedNote]);

  // --- Check if there are changes to the note ---
  const hasChanges =
    selectedNote !== undefined &&
    (editedTitle !== selectedNote.title ||
      editedContent !== selectedNote.content);

  // --- Handlers ---
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
      title: 'Untitled',
      content: '',
    };
    createMutation.mutate(defaultNoteData);
  };

  const handleDeleteNote = (id: number) => {
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
    updateMutation.mutate({ id: selectedNoteId, payload });
  };

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

  const isMutating =
    createMutation.isPending ||
    deleteMutation.isPending ||
    updateMutation.isPending;

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-1/5 flex-col border-r border-gray-200">
        <NoteSidebar
          notes={notes ?? []} // Assure que notes n'est jamais undefined ici
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
