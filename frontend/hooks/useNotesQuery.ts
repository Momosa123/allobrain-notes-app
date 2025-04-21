import { useQuery } from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api';
import { Note } from '@/lib/types/noteTypes';

/**
 * Custom hook to fetch all notes using React Query.
 * Encapsulates the query key and query function.
 * @returns The result object from useQuery (data, isLoading, isError, error, etc.)
 */
export function useNotesQuery() {
  return useQuery<Note[], Error>({
    queryKey: ['notes'], // The key for this query
    queryFn: fetchNotes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
