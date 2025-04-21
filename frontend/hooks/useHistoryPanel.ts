import { useState, useCallback } from 'react';

/**
 * Custom hook to manage the history panel.
 * @returns The result object from useHistoryPanel (data, isOpen, open, close, onOpenChange)
 */
export function useHistoryPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    open,
    close,
    onOpenChange: setIsOpen,
  };
}
