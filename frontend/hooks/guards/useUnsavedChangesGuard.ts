import { useCallback } from 'react';
import { toast } from 'sonner'; // For save errors
import { Note } from '@/lib/types/noteTypes';

interface UseUnsavedChangesGuardProps {
  hasChanges: boolean;
  saveAction: () => Promise<Note> | void;
}

/**
 * Custom hook to manage unsaved changes.
 * @param hasChanges - Whether there are unsaved changes.
 * @param saveAction - The action to save the changes.
 * @returns The result object from useUnsavedChangesGuard (confirmAndProceed)
 */
export function useUnsavedChangesGuard({
  hasChanges,
  saveAction,
}: UseUnsavedChangesGuardProps) {
  const confirmAndProceed = useCallback(
    async (proceedAction: () => void) => {
      if (!hasChanges) {
        // No changes, proceed directly
        proceedAction();
        return;
      }

      // There are changes, ask for confirmation
      if (
        window.confirm(
          'Vous avez des modifications non enregistrées. Enregistrer avant de continuer ?\n(Annuler pour abandonner les modifications et continuer)'
        )
      ) {
        // The user wants to save
        try {
          // Try to wait for the save, works if saveAction returns a promise
          await saveAction();
          // The save succeeded (no error was thrown)
          proceedAction(); // Execute the next action
        } catch (error) {
          console.error('Failed to save changes:', error);
          toast.error('Failed to save changes. Please try again.');
        }
      } else {
        // The user wants to discard the changes and proceed
        proceedAction(); // Execute the next action
      }
    },
    [hasChanges, saveAction]
  );

  return { confirmAndProceed };
}
