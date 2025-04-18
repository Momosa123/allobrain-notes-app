'use client';
// Import necessary dependencies for data fetching and types
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotes,
  Note,
  createNote,
  NoteCreatePayload,
  deleteNote,
} from '@/lib/api';
import { useState } from 'react';
import NoteSidebar from '@/components/notes/NoteSidebar';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteActionBar from '@/components/notes/NoteActionBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
/*
  Home component that displays a list of notes
 */
export default function Home() {
  // Fetch notes using React Query hook
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const {
    data: notes,
    isError,
    isLoading,
    error,
  } = useQuery<Note[], Error>({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newlyCreatedNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNoteId(newlyCreatedNote.id);
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
    },
    onError: (error) => {
      console.error('Failed to delete note:', error);
    },
  });

  const selectedNote = notes?.find((note) => note.id === selectedNoteId);

  const handleSelectNote = (id: number) => {
    setSelectedNoteId(id);
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

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-1/5 flex-col border-r border-gray-200">
        <NoteSidebar
          notes={notes}
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
        />
        <div className="flex-1 overflow-y-auto">
          {isLoading || createMutation.isPending || deleteMutation.isPending ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <NoteEditor selectedNote={selectedNote} />
          )}
        </div>
      </div>
    </main>
  );
}
