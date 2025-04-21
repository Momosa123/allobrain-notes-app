import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NoteEditor from './NoteEditor';
import { Note } from '@/lib/types/noteTypes';

interface EditorDisplayProps {
  isLoading: boolean; // Loading notes list
  isMutating: boolean; // Is a mutation (save, delete, create, restore) in progress?
  note: Note | undefined; // The currently selected note object (or undefined)
  editedTitle: string; // Current title in editor (from Zustand)
  editedContent: string; // Current content in editor (from Zustand)
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}
/**
 * EditorDisplay component that displays the editor
 * @param {boolean} isLoading - Whether the notes list is loading
 * @param {boolean} isMutating - Whether a mutation is in progress
 * @param {Note | undefined} note - The currently selected note object (or undefined)
 * @param {string} editedTitle - The current title in editor (from Zustand)
 * @param {string} editedContent - The current content in editor (from Zustand)
 */
export default function EditorDisplay({
  isLoading,
  isMutating,
  note,
  editedTitle,
  editedContent,
  onTitleChange,
  onContentChange,
}: EditorDisplayProps) {
  // Display large spinner only during initial load
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Display smaller spinner during mutations IF a note is selected
  if (isMutating && note) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // If a note is selected (and not loading/mutating), show the editor
  if (note) {
    return (
      <NoteEditor
        // Use note.id as key to force re-mount on note change
        key={note.id}
        title={editedTitle}
        content={editedContent}
        onTitleChange={onTitleChange}
        onContentChange={onContentChange}
      />
    );
  }

  // Otherwise (no note selected and not loading), show the empty state message
  return (
    <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
      Sélectionnez une note pour la voir ou la modifier, ou créez-en une
      nouvelle.
    </div>
  );
}
