import React from 'react';
import VersionListItem from './VersionListItem'; // Import the item component
import { NoteVersion } from '@/lib/api';

interface VersionHistoryListProps {
  versions: NoteVersion[]; // Array of versions
  onRestore: (versionId: number) => void; // Restore callback function
  // onPreview?: (version: NoteVersion) => void; // Optional preview callback
}

export default function VersionHistoryList({
  versions,
  onRestore,
  // onPreview,
}: VersionHistoryListProps) {
  if (!versions || versions.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Aucun historique de version pour cette note.
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {' '}
      {/* Container with vertical scroll */}
      {versions.map((version) => (
        <VersionListItem
          key={version.id} // Use version ID as the key
          version={version}
          onRestore={onRestore}
          // onPreview={onPreview} // Pass down preview handler if needed
        />
      ))}
    </div>
  );
}
