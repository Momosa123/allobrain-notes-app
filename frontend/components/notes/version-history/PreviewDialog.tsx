import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NoteVersion } from '@/lib/types/noteTypes';

interface PreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  version: NoteVersion | null;
}
/**
 * PreviewDialog component that displays a preview of a note
 * @param {boolean} isOpen - Whether the dialog is open
 * @param {function} onOpenChange - The function to call when the dialog is opened or closed
 * @param {NoteVersion | null} version - The version of the note to preview
 */
export default function PreviewDialog({
  isOpen,
  onOpenChange,
  version,
}: PreviewDialogProps) {
  if (!version) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Prévisualisation : {version.title || 'Version sans titre'}
          </DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert max-h-[60vh] min-h-[20rem] max-w-none overflow-y-auto py-4">
          <pre className="font-sans text-sm whitespace-pre-wrap">
            {version.content || 'Version vide'}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
