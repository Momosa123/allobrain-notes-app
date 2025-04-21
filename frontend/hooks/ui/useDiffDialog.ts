import { useState, useCallback } from 'react';
import { NoteVersion } from '@/lib/types/noteTypes';

interface DiffData {
  oldVersion: NoteVersion;
  currentTitle: string;
  currentContent: string;
}

/**
 * Custom hook to manage the diff dialog.
 * @returns The result object from useDiffDialog (data, isOpen,
 * oldVersion, currentTitle, currentContent, open, close, onOpenChange)
 */
export function useDiffDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [diffData, setDiffData] = useState<DiffData | null>(null);

  const open = useCallback(
    ({ oldVersion, currentTitle, currentContent }: DiffData) => {
      setDiffData({ oldVersion, currentTitle, currentContent });
      setIsOpen(true);
    },
    []
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setDiffData(null);
  }, []);

  const onOpenChange = useCallback((openState: boolean) => {
    setIsOpen(openState);
    if (!openState) {
      setDiffData(null); // clear the data when the dialog is closed
    }
  }, []);

  return {
    isOpen,
    oldVersion: diffData?.oldVersion ?? null,
    currentTitle: diffData?.currentTitle ?? '',
    currentContent: diffData?.currentContent ?? '',
    open, // takes a DiffData object
    close,
    onOpenChange,
  };
}
