import React from 'react';
import { Note } from '@/lib/api';

import { ScrollArea } from '@/components/ui/scroll-area';

import NoteListItem from './NoteListItem';

interface NoteSidebarProps {
  notes: Note[] | undefined;
  selectedNoteId: number | null;
  onSelectNote: (id: number) => void;
  isLoading: boolean;
}
/*
  NoteSidebar component that displays a list of notes
 */
export default function NoteSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  isLoading,
}: NoteSidebarProps) {
  // Helper function to get the relevant date for sorting
  const getSortDate = (note: Note): Date => {
    // Use updated_at if it exists and is a valid date string, otherwise use created_at
    // Basic check to prefer updated_at only if it's truthy
    const dateString = note.updated_at || note.created_at;
    return new Date(dateString); // Convert string to Date object
  };

  // Sort notes: most recently updated/created first
  const sortedNotes = [...(notes || [])].sort(
    (a, b) => getSortDate(b).getTime() - getSortDate(a).getTime()
  );

  return (
    <ScrollArea className="flex-1 bg-gray-100">
      <h2 className="p-4 text-4xl font-semibold text-blue-500">AlloNotes</h2>

      <div className="space-y-2 p-4">
        {sortedNotes && sortedNotes.length > 0
          ? sortedNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={onSelectNote}
              />
            ))
          : !isLoading && (
              <p className="py-4 text-center text-sm text-gray-500">
                No notes found
              </p>
            )}
      </div>
    </ScrollArea>
  );
}
