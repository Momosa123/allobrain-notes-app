import React from 'react';
import { Pencil, Save, Trash2, History } from 'lucide-react';

import { TooltipProvider } from '@/components/ui/tooltip';
import IconButton from '../../ui/IconButton';
import { cn } from '@/lib/utils';

interface NoteActionBarProps {
  selectedNoteId: number | null;
  onCreateNote: () => void;
  onDeleteNote: (id: number) => void;
  onSaveChanges: () => void;
  onShowHistory?: () => void;
  hasChanges: boolean;
  isSaving: boolean;
}
/**
  NoteActionBar component that displays icons for actions on a note
  @param {number | null} selectedNoteId - The id of the selected note
  @param {function} onCreateNote - The function to call when the new note button is clicked
  @param {function} onDeleteNote - The function to call when the delete note button is clicked
  @param {function} onSaveChanges - The function to call when the save changes button is clicked
  @param {function} onShowHistory - The function to call when the history button is clicked
  @param {boolean} hasChanges - Whether the note has changes
  @param {boolean} isSaving - Whether the note is being saved
 */

export default function NoteActionBar({
  selectedNoteId,
  onCreateNote,
  onDeleteNote,
  onSaveChanges,
  onShowHistory,
  hasChanges,
  isSaving,
}: NoteActionBarProps) {
  const handleDeleteClick = () => {
    if (selectedNoteId !== null) {
      if (window.confirm('Vous êtes sûr de vouloir supprimer cette note?')) {
        onDeleteNote(selectedNoteId);
      }
    }
  };

  let saveTooltip = 'Enregistrer les modifications';
  if (!selectedNoteId) {
    saveTooltip = 'Sélectionnez une note pour enregistrer';
  } else if (!hasChanges) {
    saveTooltip = 'Aucune modification à enregistrer';
  } else if (isSaving) {
    saveTooltip = 'Enregistrement...';
  }

  const isSaveDisabled = !selectedNoteId || !hasChanges || isSaving;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-[57px] items-center justify-end space-x-2 bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
        <IconButton
          icon={Pencil}
          tooltipContent="Nouvelle note"
          srText="Nouvelle note"
          onClick={onCreateNote}
          iconSize="size-5"
        />

        <IconButton
          icon={History}
          tooltipContent="Voir l'historique"
          srText="Voir l'historique"
          onClick={onShowHistory}
          disabled={!selectedNoteId}
          className={cn(
            !selectedNoteId && 'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          iconSize="size-5"
        />

        <IconButton
          icon={Save}
          tooltipContent={saveTooltip}
          srText="Enregistrer les modifications"
          onClick={onSaveChanges}
          disabled={isSaveDisabled}
          className={cn(
            'text-green-600 hover:text-green-700',
            isSaveDisabled && 'disabled:cursor-not-allowed disabled:opacity-50',
            isSaving && 'animate-pulse'
          )}
          iconSize="size-5"
        />

        <IconButton
          icon={Trash2}
          tooltipContent={
            selectedNoteId !== null
              ? 'Supprimer la note'
              : 'Sélectionnez une note pour la supprimer'
          }
          srText="Supprimer la note"
          onClick={handleDeleteClick}
          disabled={selectedNoteId === null || isSaving}
          className={cn(
            'text-red-500 hover:text-red-600',
            (selectedNoteId === null || isSaving) &&
              'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          iconSize="size-5"
        />
      </div>
    </TooltipProvider>
  );
}
