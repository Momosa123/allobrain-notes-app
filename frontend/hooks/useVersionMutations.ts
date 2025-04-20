import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restoreNoteVersion, Note } from '../lib/api'; // Assuming Note type is exported from api
import { useNoteStore } from '@/store/noteStore'; // Import Zustand store hook

interface RestorePayload {
  noteId: number;
  versionId: number;
}

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

      // Optional: Prefetch or set query data if needed for faster UI update
      // queryClient.setQueryData(['notes', noteId], data); // Example if fetching single note
    },
    onError: (error) => {
      console.error('Failed to restore note version:', error);
      // Consider adding user feedback here (e.g., toast notification)
    },
  });
};
