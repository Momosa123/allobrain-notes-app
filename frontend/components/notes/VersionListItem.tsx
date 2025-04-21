import React from 'react';

interface NoteVersion {
  id: number;
  note_id: number;
  title: string;
  content: string;
  version_timestamp: string; // ISO string format expected
}

interface VersionListItemProps {
  version: NoteVersion;
  onRestore: (versionId: number) => void; // Action for restore button
  // onPreview?: (version: NoteVersion) => void; // Optional action for preview
}

export default function VersionListItem({
  version,
  onRestore,
  // onPreview,
}: VersionListItemProps) {
  // Format the timestamp for display
  const formattedTimestamp = new Date(version.version_timestamp).toLocaleString(
    // You can customize locale and options
    'fr-FR', // Example: French locale
    {
      dateStyle: 'short',
      timeStyle: 'medium',
    }
  );

  const handleRestoreClick = () => {
    onRestore(version.id);
  };

  // const handlePreviewClick = () => {
  //   if (onPreview) {
  //     onPreview(version);
  //   }
  // };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
      {/* We could add a preview click handler here later */}
      <span className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
        {formattedTimestamp}
      </span>
      <button
        onClick={handleRestoreClick}
        className="ml-4 cursor-pointer rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
        aria-label={`Restaurer la version du ${formattedTimestamp}`}
      >
        Restaurer
      </button>
    </div>
  );
}
