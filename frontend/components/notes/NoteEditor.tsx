import React from 'react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NoteEditorProps {
  title: string;
  content: string;
  onTitleChange: (newTitle: string) => void;
  onContentChange: (newContent: string) => void;
}

/**
 * NoteEditor component that displays a note
 */
export default function NoteEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
}: NoteEditorProps) {
  return (
    <div className="flex h-full flex-col space-y-4 p-6">
      {/* Title Input */}
      <Input
        placeholder="Untitled"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onTitleChange(e.target.value)
        }
        className="border-none text-5xl font-bold shadow-none focus-visible:ring-0"
        aria-label="Note Title"
      />
      {/* Content Textarea */}
      <Textarea
        placeholder="Start writing your note..."
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onContentChange(e.target.value)
        }
        className="flex-1 resize-none border-none text-2xl shadow-none focus-visible:ring-0"
        aria-label="Note Content"
      />
    </div>
  );
}
