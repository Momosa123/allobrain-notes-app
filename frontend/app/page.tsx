'use client';
// Import necessary dependencies for data fetching and types
import { useQuery } from '@tanstack/react-query';
import { fetchNotes, Note } from '@/lib/api';

/**
 * Home component that displays a list of notes
 * Uses React Query for efficient server state management and caching
 */
export default function Home() {
  // Fetch notes using React Query hook
  const {
    data: notes,
    isLoading,
    error,
  } = useQuery<Note[], Error>({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  // Show loading state while data is being fetched
  if (isLoading) return <div>Loading...</div>;

  // Show error message if fetch fails
  if (error)
    return <div>Error fetching notes: {error?.message || 'Unknown error'}</div>;

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">My Notes</h1>

      {notes && notes.length > 0 ? (
        <ul className="list-disc">
          {notes?.map((note) => (
            <li className="mb-2 rounded-md border p-2" key={note.id}>
              <h2 className="text-lg font-bold">{note.title}</h2>
              <p className="text-sm">{note.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notes found</p>
      )}
    </main>
  );
}
