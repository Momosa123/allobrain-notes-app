import React from 'react';
import { GitCompareArrows } from 'lucide-react'; // Import compare icon
import { NoteVersion } from '@/lib/types/noteTypes';

interface VersionListItemProps {
  version: NoteVersion;
  onRestore: (versionId: number) => void; // Action for restore button
  onPreview?: (version: NoteVersion) => void;
  onCompare?: (version: NoteVersion) => void; // Add onCompare prop
}
/**
 * VersionListItem component that displays a version in the history list
 * @param {NoteVersion} version - The version to display
 * @param {function} onRestore - The function to call when the restore button is clicked
 * @param {function} onPreview - The function to call when the preview button is clicked
 * @param {function} onCompare - The function to call when the compare button is clicked
 */
export default function VersionListItem({
  version,
  onRestore,
  onPreview, // Receive the prop
  onCompare, // Receive the prop
}: VersionListItemProps) {
  // Format the timestamp for display
  const formattedTimestamp = new Date(version.version_timestamp).toLocaleString(
    'fr-FR',
    {
      dateStyle: 'short',
      timeStyle: 'medium',
    }
  );

  const handleRestoreClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the preview onClick on the parent div
    onRestore(version.id);
  };

  const handlePreviewClick = () => {
    if (onPreview) {
      onPreview(version);
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering preview
    if (onCompare) {
      onCompare(version);
    }
  };

  return (
    <div
      className="flex cursor-pointer items-center justify-between border-b border-gray-200 p-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      onClick={handlePreviewClick}
      role="button"
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handlePreviewClick();
        }
      }}
    >
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {formattedTimestamp}
      </span>
      {/* Action Buttons Container */}
      <div className="ml-4 flex items-center space-x-2">
        {/* Compare Button (NEW) */}
        {onCompare && (
          <button
            onClick={handleCompareClick}
            className="rounded p-1 text-gray-500 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label={`Comparer la version du ${formattedTimestamp} avec la version actuelle`}
            title="Comparer avec la version actuelle"
          >
            <GitCompareArrows className="h-4 w-4" />
          </button>
        )}

        {/* Restore Button */}
        <button
          onClick={handleRestoreClick}
          className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
          aria-label={`Restaurer la version du ${formattedTimestamp}`}
        >
          Restaurer
        </button>
      </div>
    </div>
  );
}
