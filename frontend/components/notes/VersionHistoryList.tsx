import React from 'react';
import VersionListItem from './VersionListItem';
import { NoteVersion } from '@/lib/api';

interface VersionHistoryListProps {
  versions: NoteVersion[];
  onRestore: (versionId: number) => void;
  onPreview?: (version: NoteVersion) => void;
  onCompare?: (version: NoteVersion) => void;
}

export default function VersionHistoryList({
  versions,
  onRestore,
  onPreview,
  onCompare,
}: VersionHistoryListProps) {
  if (!versions || versions.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Aucun historique de version pour cette note.
      </div>
    );
  }

  return (
    <div>
      {versions.map((version) => (
        <VersionListItem
          key={version.id}
          version={version}
          onRestore={onRestore}
          onPreview={onPreview}
          onCompare={onCompare}
        />
      ))}
    </div>
  );
}
