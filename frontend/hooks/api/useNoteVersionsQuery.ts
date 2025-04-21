import { useQuery } from '@tanstack/react-query';
import { getNoteVersions } from '@/lib/api';
import { NoteVersion } from '@/lib/types/noteTypes';

/**
 * Custom hook to fetch the versions of a note using React Query.
 * @param noteId - The ID of the note to fetch versions for.
 * @param enabled - Whether the query should be enabled.
 * @returns The result object from useQuery (data, isLoading, isError, error, etc.)
 */
export const useNoteVersionsQuery = (
  noteId: number | null,
  enabled: boolean // Explicitly control if the query should run
) => {
  return useQuery<NoteVersion[], Error>({
    // Query key includes the noteId to ensure uniqueness per note
    queryKey: ['noteVersions', noteId],

    // The function to fetch data
    // Only calls getNoteVersions if noteId is a valid number
    queryFn: () => {
      if (typeof noteId !== 'number') {
        // If no noteId, return an empty array or handle as appropriate
        // Returning Promise.resolve([]) prevents an unnecessary fetch attempt
        return Promise.resolve([]);
      }
      return getNoteVersions(noteId);
    },

    // Control whether the query should automatically run
    // Depends on having a valid noteId AND the enabled flag passed in
    enabled: typeof noteId === 'number' && enabled,
  });
};
