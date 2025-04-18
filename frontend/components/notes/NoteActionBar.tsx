import React from 'react';
import { TrashIcon, Pencil, GitCompareArrows } from 'lucide-react';

import { TooltipProvider } from '@/components/ui/tooltip';
import IconButton from '../ui/IconButton';

interface NoteActionBarProps {
  selectedNoteId: number | null;
  onCreateNote: () => void;
  onDeleteNote: (id: number) => void;
}
/*
  NoteActionBar component that displays icons for actions on a note
 */

export default function NoteActionBar({
  selectedNoteId,
  onCreateNote,
  onDeleteNote,
}: NoteActionBarProps) {
  const handleDeleteClick = () => {
    if (selectedNoteId !== null) {
      if (window.confirm('Are you sure you want to delete this note?')) {
        onDeleteNote(selectedNoteId);
      }
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-[57px] items-center justify-end space-x-2 px-4">
        <IconButton
          icon={Pencil}
          tooltipContent="New Note"
          srText="New Note"
          onClick={onCreateNote}
          iconSize="size-5"
        />

        <IconButton
          icon={TrashIcon}
          tooltipContent={
            selectedNoteId !== null ? 'Delete Note' : 'Select a note to delete'
          }
          srText="Delete Note"
          onClick={handleDeleteClick}
          disabled={selectedNoteId === null}
          className="text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          iconSize="size-5"
        />

        <IconButton
          icon={GitCompareArrows}
          tooltipContent="View Versions (Coming Soon)"
          srText="View Versions"
          disabled // Désactivé pour l'instant
          // onClick={handleShowVersions} // Fonction future
          iconSize="size-5" // Personnalise la taille si besoin
        />
      </div>
    </TooltipProvider>
  );
}
