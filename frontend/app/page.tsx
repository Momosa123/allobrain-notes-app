'use client';
// Import necessary dependencies for data fetching and types
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotes, Note, createNote, NoteCreatePayload } from '@/lib/api';
import { useState } from 'react';
import NoteSidebar from '@/components/notes/NoteSidebar';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteActionBar from '@/components/notes/NoteActionBar';
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
      console.log('Note created:', newlyCreatedNote);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNoteId(newlyCreatedNote.id);
    },
    onError: (error) => {
      console.error('Failed to create note:', error);
    },
  });

  const selectedNote = notes?.find((note) => note.id === selectedNoteId);

  console.log(selectedNote);

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

  // Show loading state while data is being fetched
  if (isLoading) return <div>Loading...</div>;

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
        />
        <div className="flex-1 overflow-y-auto">
          {(isLoading || createMutation.isPending) && (
            <div className="p-6">Loading...</div>
          )}
          {!(isLoading || createMutation.isPending) && (
            <NoteEditor selectedNote={selectedNote} />
          )}
        </div>
      </div>
    </main>
  );
}
