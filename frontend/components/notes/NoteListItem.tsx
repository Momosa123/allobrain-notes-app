import React from 'react';
import { Note } from '@/lib/api';

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

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
      <h3 className="flex-shrink-0 truncate font-medium">{note.title}</h3>
      <p className="mt-1 flex-shrink-0 text-xs text-gray-600">
        {formattedDate}
      </p>
      <p className="mt-1 flex-grow overflow-hidden text-sm text-ellipsis whitespace-nowrap text-gray-500">
        {note.content || <span className="italic">No content</span>}
      </p>
    </div>
  );
}
