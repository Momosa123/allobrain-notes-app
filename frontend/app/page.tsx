'use client';
// Import necessary dependencies for data fetching and types
import { useQuery } from '@tanstack/react-query';
import { fetchNotes, Note } from '@/lib/api';
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
  const {
    data: notes,
    isError,
    isLoading,
    error,
  } = useQuery<Note[], Error>({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  const selectedNote = notes?.find((note) => note.id === selectedNoteId);

  console.log(selectedNote);
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
          onSelectNote={setSelectedNoteId}
          isLoading={isLoading}
        />
      </div>
      {/* Editor */}
      <div className="flex flex-1 flex-col">
        <NoteActionBar
          selectedNoteId={selectedNoteId}
          onCreateNote={() => {}}
        />
        <div className="flex-1 overflow-y-auto">
          {!isLoading && <NoteEditor selectedNote={selectedNote} />}
          {isLoading && <div>Loading...</div>}
        </div>
      </div>
    </main>
  );
}
