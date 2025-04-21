import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NoteVersion } from '@/lib/types/noteTypes';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

interface DiffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  oldVersion: NoteVersion | null;
  currentTitle: string;
  currentContent: string;
}
/**
 * DiffDialog component that displays a diff between two versions of a note
 * @param {boolean} isOpen - Whether the dialog is open
 * @param {function} onOpenChange - The function to call when the dialog is opened or closed
 * @param {NoteVersion | null} oldVersion - The old version of the note
 * @param {string} currentTitle - The title of the current version of the note
 * @param {string} currentContent - The content of the current version of the note
 */
export default function DiffDialog({
  isOpen,
  onOpenChange,
  oldVersion,
  currentTitle,
  currentContent,
}: DiffDialogProps) {
  if (!oldVersion) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-[70vh] min-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Comparaison des versions</DialogTitle>
        </DialogHeader>
        <div className="min-h-[70vh] min-w-[40vw] overflow-y-auto">
          <ReactDiffViewer
            oldValue={oldVersion.content || ''}
            newValue={currentContent || ''}
            leftTitle={`Version : ${oldVersion.title || 'Sans titre'}`}
            rightTitle={`Version actuelle : ${currentTitle || 'Sans titre'}`}
            splitView={false}
            compareMethod={DiffMethod.WORDS}
            hideLineNumbers={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
