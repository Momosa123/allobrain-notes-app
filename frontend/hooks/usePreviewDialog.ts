import { useState, useCallback } from 'react';
import { NoteVersion } from '@/lib/types/noteTypes';

/**
 * Custom hook to manage the preview dialog.
 * @returns The result object from usePreviewDialog (data, isOpen,
 * version, open, close, onOpenChange)
 */
export function usePreviewDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [version, setVersion] = useState<NoteVersion | null>(null);

  const open = useCallback((versionToShow: NoteVersion) => {
    setVersion(versionToShow);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setVersion(null);
  }, []);

  // Handles the opening/closing via the Dialog component
  // and cleans the version when closing
  const onOpenChange = useCallback((openState: boolean) => {
    setIsOpen(openState);
    if (!openState) {
      setVersion(null); // clean the version when the dialog closes
    }
  }, []);

  return {
    isOpen,
    version, // The version to display
    open, // Function to open with a specific version
    close, // Function to close explicitly
    onOpenChange, // Function to pass to Dialog
  };
}
