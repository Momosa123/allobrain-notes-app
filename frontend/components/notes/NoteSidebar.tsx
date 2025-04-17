import React from 'react';
import { Note } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil } from 'lucide-react';
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
  // Sort notes by creation date (descending)
  const sortedNotes = [...(notes || [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
        {isLoading && (
          <p className="py-4 text-center text-sm text-gray-500">Loading...</p>
        )}
      </div>
    </ScrollArea>
  );
}
