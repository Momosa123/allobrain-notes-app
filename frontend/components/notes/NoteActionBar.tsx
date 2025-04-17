import React from 'react';
import { TrashIcon, Pencil, GitCompareArrows } from 'lucide-react';

import { TooltipProvider } from '@/components/ui/tooltip';
import IconButton from '../ui/IconButton';

interface NoteActionBarProps {
  selectedNoteId: number | null;
  onCreateNote: () => void;
}
/*
  NoteActionBar component that displays icons for actions on a note
 */

export default function NoteActionBar({
  selectedNoteId,
  onCreateNote,
}: NoteActionBarProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-[57px] items-center justify-end space-x-2 px-4">
        <IconButton
          icon={Pencil}
          tooltipContent="New Note"
          srText="New Note"
          onClick={onCreateNote}
          iconClassName="size-5"
        />

        <IconButton
          icon={TrashIcon}
          tooltipContent={
            selectedNoteId !== null ? 'Delete Note' : 'Select a note to delete'
          }
          srText="Delete Note"
          disabled={selectedNoteId === null}
          className="text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          iconClassName="size-5"
        />

        <IconButton
          icon={GitCompareArrows}
          tooltipContent="View Versions (Coming Soon)"
          srText="View Versions"
          disabled // Désactivé pour l'instant
          // onClick={handleShowVersions} // Fonction future
          iconClassName="size-5" // Personnalise la taille si besoin
        />
      </div>
    </TooltipProvider>
  );
}
