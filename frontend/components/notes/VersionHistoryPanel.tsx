import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import VersionHistoryList from './VersionHistoryList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { NoteVersion } from '@/lib/api';

interface VersionHistoryPanelProps {
  isOpen: boolean; // Controls visibility
  onClose: () => void; // Function to call when closing the panel
  versions: NoteVersion[] | undefined; // Array of versions (can be undefined while loading)
  isLoading: boolean; // Loading state for fetching versions
  isError: boolean; // Error state for fetching versions
  onRestore: (versionId: number) => void; // Restore callback function
  // onPreview?: (version: NoteVersion) => void; // Optional preview callback
}

export default function VersionHistoryPanel({
  isOpen,
  onClose,
  versions,
  isLoading,
  isError,
  onRestore,
  // onPreview,
}: VersionHistoryPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent className="flex w-[320px] flex-col sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Historique des Versions</SheetTitle>
          {/* Optional: <SheetDescription>...</SheetDescription> */}
        </SheetHeader>

        <div className="mt-4 flex-grow overflow-y-auto pr-6">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
          {isError && (
            <div className="p-4 text-center text-red-600 dark:text-red-400">
              Erreur lors du chargement de l&apos;historique.
            </div>
          )}
          {!isLoading && !isError && (
            <VersionHistoryList
              versions={versions || []}
              onRestore={onRestore}
              // onPreview={onPreview}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
