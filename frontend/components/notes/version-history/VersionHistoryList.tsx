import React from 'react';
import VersionListItem from './VersionListItem';
import { NoteVersion } from '@/lib/types/noteTypes';

interface VersionHistoryListProps {
  versions: NoteVersion[];
  onRestore: (versionId: number) => void;
  onPreview?: (version: NoteVersion) => void;
  onCompare?: (version: NoteVersion) => void;
}
/**
 * VersionHistoryList component that displays a list of versions
 * @param {NoteVersion[]} versions - The list of versions to display
 * @param {function} onRestore - The function to call when a version is restored
 * @param {function} onPreview - The function to call when a version is previewed
 * @param {function} onCompare - The function to call when a version is compared
 */
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
