import React from 'react';
import { Note } from '@/lib/types/noteTypes';

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: number) => void;
}
/**
 * NoteListItem component that displays a note in the sidebar
 * @param {Note} note - The note to display
 * @param {boolean} isSelected - Whether the note is selected
 * @param {function} onSelect - The function to call when the note is selected
 */
export default function NoteListItem({
  note,
  isSelected,
  onSelect,
}: NoteListItemProps) {
  // Format the date for display
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
  }).format(new Date(note.created_at));

  return (
    <div
      className={`flex h-24 cursor-pointer flex-col overflow-hidden rounded p-2 ${
        isSelected
          ? 'border-l-4 border-blue-500 bg-blue-100' // Blue style when selected
          : 'border-b-1 border-blue-500 hover:bg-gray-50' // Border only if not selected
      }`}
      onClick={() => onSelect(note.id)}
    >
      <h3 className="flex-shrink-0 truncate text-lg font-medium">
        {note.title || 'Untitled'}
      </h3>
      <p className="mt-1 flex-shrink-0 text-xs text-gray-600">
        {formattedDate}
      </p>
      <p className="mt-1 truncate text-sm text-gray-500">
        {note.content || <span className="italic">No content</span>}
      </p>
    </div>
  );
}
