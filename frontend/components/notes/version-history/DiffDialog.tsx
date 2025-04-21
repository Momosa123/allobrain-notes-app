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

  const oldTitle = oldVersion.title || 'Sans titre';
  const newTitle = currentTitle || 'Sans titre';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-[70vh] max-w-7xl min-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Comparaison des versions</DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] min-h-[70vh] overflow-y-auto pr-2">
          <div className="mb-4">
            <h4 className="text-muted-foreground mb-2 text-sm font-semibold">
              Changement de Titre
            </h4>
            <div className="border dark:border-gray-700">
              <ReactDiffViewer
                oldValue={oldTitle}
                newValue={newTitle}
                splitView={false}
                compareMethod={DiffMethod.WORDS}
                hideLineNumbers={true}
              />
            </div>
          </div>

          <div>
            <h4 className="text-muted-foreground mb-2 text-sm font-semibold">
              Changement de Contenu
            </h4>
            <div className="border dark:border-gray-700">
              <ReactDiffViewer
                oldValue={oldVersion.content || ''}
                newValue={currentContent || ''}
                splitView={false}
                compareMethod={DiffMethod.WORDS}
                hideLineNumbers={false}
                leftTitle={`Version du ${new Date(oldVersion.version_timestamp).toLocaleDateString()}`}
                rightTitle="Version Actuelle"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
