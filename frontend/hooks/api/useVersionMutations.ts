import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restoreNoteVersion } from '@/lib/api';
import { useNoteStore } from '@/store/noteStore';
import { toast } from 'sonner';
import { Note } from '@/lib/types/noteTypes';
import { RestorePayload } from '@/lib/types/noteTypes';

/**
 * Custom hook to restore a note version.
 * @returns The result object from useRestoreNoteVersionMutation (data, isPending, isError, error, etc.)
 */
export const useRestoreNoteVersionMutation = () => {
  const queryClient = useQueryClient();
  const { setEditorState } = useNoteStore(); // Get Zustand action

  return useMutation<Note, Error, RestorePayload>({
    mutationFn: ({ noteId, versionId }: RestorePayload) =>
      restoreNoteVersion({ noteId, versionId }),
    onSuccess: (data, variables) => {
      // 'data' should be the updated note returned by the backend after restoration
      const { noteId } = variables;

      // Update the editor state immediately with the restored content
      setEditorState(data.title, data.content);

      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['noteVersions', noteId] });

      // Show success toast
      toast.success('Version restaurée avec succès !');
    },
    onError: (error) => {
      console.error('Failed to restore note version:', error);
      // Show error toast
      toast.error('Erreur lors de la restauration de la version.');
    },
  });
};
