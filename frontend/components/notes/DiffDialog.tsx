import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NoteVersion } from '@/lib/api';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

interface DiffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  oldVersion: NoteVersion | null;
  currentTitle: string;
  currentContent: string;
}

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
        <div className="min-h-[70vh] min-w-[40vw]">
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
