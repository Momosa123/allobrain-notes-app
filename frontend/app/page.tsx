'use client';

import { NoteVersion } from '@/lib/types/noteTypes';
import { useCallback } from 'react';
import { useHistoryPanel } from '@/hooks/useHistoryPanel';
import { usePreviewDialog } from '@/hooks/usePreviewDialog';
import { useDiffDialog } from '@/hooks/useDiffDialog';
import { useNoteManager } from '@/hooks/useNoteManager';
import VersionHistoryPanel from '@/components/notes/VersionHistoryPanel';
import PreviewDialog from '@/components/notes/PreviewDialog';
import DiffDialog from '@/components/notes/DiffDialog';
import NoteSidebar from '@/components/notes/NoteSidebar';
import NoteActionBar from '@/components/notes/NoteActionBar';
import NoteLayout from '@/components/layout/NoteLayout';
import EditorDisplay from '@/components/notes/EditorDisplay';
import { useNoteVersionsQuery } from '@/hooks/useNoteVersionsQuery';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import QueryBoundary from '@/components/common/QueryBoundary';

/*
  Home component that displays a list of notes
 */
export default function Home() {
  // --- Main Logic Hook ---
  const {
    notes,
    isLoading,
    isError,
    error,
    selectedNote,
    selectedNoteId,
    hasChanges,
    isMutating,
    title: editedTitle,
    content: editedContent,
    selectNote,
    createNote,
    saveNote,
    deleteNote,
    restoreNoteVersion,
    onTitleChange,
    onContentChange,
  } = useNoteManager();

  // --- UI Hooks ---
  const historyPanel = useHistoryPanel();
  const previewDialog = usePreviewDialog();
  const diffDialog = useDiffDialog();

  // --- Guard Hook ---
  const guard = useUnsavedChangesGuard({ hasChanges, saveAction: saveNote });

  // --- Query for Note Versions  ---
  const {
    data: versionsData,
    isLoading: isVersionsLoading,
    isError: isVersionsError,
  } = useNoteVersionsQuery(selectedNoteId, historyPanel.isOpen);

  // --- Handlers ---
  const handleSelectNote = useCallback(
    (id: number) => {
      if (selectedNoteId === id) return;

      // Define the action to take after potential save/confirmation
      const proceedAction = () => {
        selectNote(id); // Select the new note
        // Close all panels/dialogs
        historyPanel.close();
        previewDialog.close();
        diffDialog.close();
      };

      // Use the guard hook
      guard.confirmAndProceed(proceedAction);
    },
    [
      selectedNoteId, // selectedNoteId from useNoteManager
      guard, // The guard hook instance
      selectNote, // selectNote from useNoteManager
      historyPanel,
      previewDialog,
      diffDialog,
    ]
  );

  const handleRestoreVersion = useCallback(
    (versionId: number) => {
      // Call the action from useNoteManager
      restoreNoteVersion(versionId);

      // Close UI elements immediately after triggering the action
      // (The mutation hook itself handles success/error toasts)
      previewDialog.close();
      diffDialog.close();
      historyPanel.close(); // Close history panel after initiating restore
    },
    [restoreNoteVersion, historyPanel, previewDialog, diffDialog] // Dependencies updated
  );

  const handlePreviewVersion = previewDialog.open;

  const handleCompareVersion = useCallback(
    (versionToDiff: NoteVersion) => {
      const currentTitle = editedTitle;
      const currentContentValue = editedContent;
      previewDialog.close();
      diffDialog.open({
        oldVersion: versionToDiff,
        currentTitle: currentTitle,
        currentContent: currentContentValue,
      });
    },
    [editedTitle, editedContent, previewDialog, diffDialog]
  );

  return (
    <QueryBoundary
      isLoading={isLoading && !notes}
      isError={isError}
      error={error}
    >
      <NoteLayout
        sidebar={
          <NoteSidebar
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            isLoading={isLoading}
          />
        }
        actionBar={
          <NoteActionBar
            selectedNoteId={selectedNoteId}
            onCreateNote={createNote}
            onDeleteNote={deleteNote}
            onSaveChanges={saveNote}
            hasChanges={hasChanges}
            isSaving={isMutating}
            onShowHistory={() => {
              if (selectedNoteId) {
                historyPanel.open();
              }
            }}
          />
        }
        editor={
          <EditorDisplay
            isLoading={false}
            isMutating={isMutating}
            note={selectedNote}
            editedTitle={editedTitle}
            editedContent={editedContent}
            onTitleChange={onTitleChange}
            onContentChange={onContentChange}
          />
        }
        historyPanel={
          <VersionHistoryPanel
            isOpen={historyPanel.isOpen}
            onClose={historyPanel.close}
            versions={versionsData}
            isLoading={isVersionsLoading}
            isError={isVersionsError}
            onRestore={handleRestoreVersion}
            onPreview={handlePreviewVersion}
            onCompare={handleCompareVersion}
          />
        }
        previewDialog={
          <PreviewDialog
            isOpen={previewDialog.isOpen}
            onOpenChange={previewDialog.onOpenChange}
            version={previewDialog.version}
          />
        }
        diffDialog={
          <DiffDialog
            isOpen={diffDialog.isOpen}
            onOpenChange={diffDialog.onOpenChange}
            oldVersion={diffDialog.oldVersion}
            currentTitle={diffDialog.currentTitle}
            currentContent={diffDialog.currentContent}
          />
        }
      />
    </QueryBoundary>
  );
}
