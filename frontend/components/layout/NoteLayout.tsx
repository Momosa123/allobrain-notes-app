import React from 'react';

interface NoteLayoutProps {
  sidebar: React.ReactNode;
  actionBar: React.ReactNode;
  editor: React.ReactNode;
  historyPanel?: React.ReactNode; // Optional because it's conditionally rendered
  previewDialog?: React.ReactNode; // Optional
  diffDialog?: React.ReactNode; // Optional
}

export default function NoteLayout({
  sidebar,
  actionBar,
  editor,
  historyPanel,
  previewDialog,
  diffDialog,
}: NoteLayoutProps) {
  return (
    <main className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-1/5 flex-col border-r border-gray-200 dark:border-gray-700">
        {/* We display the sidebar passed as a prop positionned on the left */}
        {sidebar}
      </div>

      {/* Editor Area (Action Bar + Content) */}
      <div className="flex flex-1 flex-col">
        {/* We display the action bar passed as a prop positionned on the top of the editor area */}
        {actionBar}
        {/* We display the editor passed as a prop positionned on the bottom of the editor area */}
        <div className="flex-1 overflow-y-auto p-6">{editor}</div>
      </div>

      {/* We display the history panel, preview dialog and diff dialog
      passed as props positionned on the right */}
      {historyPanel}
      {previewDialog}
      {diffDialog}
    </main>
  );
}
