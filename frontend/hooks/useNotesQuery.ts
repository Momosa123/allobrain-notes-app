// frontend/hooks/useNotesQuery.ts
import { useQuery } from '@tanstack/react-query';
import { fetchNotes, Note } from '@/lib/api'; // Importe la fonction API et le type Note

/**
 * Custom hook to fetch all notes using React Query.
 * Encapsulates the query key and query function.
 * @returns The result object from useQuery (data, isLoading, isError, error, etc.)
 */
export function useNotesQuery() {
  // Encapsule l'appel useQuery
  return useQuery<Note[], Error>({
    queryKey: ['notes'], // La clé de requête pour identifier cette donnée
    queryFn: fetchNotes, // La fonction API à appeler pour fetcher
    // Tu pourrais ajouter d'autres options ici :
    // staleTime: 5 * 60 * 1000, // Données considérées fraîches pendant 5 minutes
    // refetchOnWindowFocus: false, // Éviter les refetchs automatiques
  });
}
