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
 * NoteEditor component that displays a note editor
 * @param {string} title - The title of the note
 * @param {string} content - The content of the note
 * @param {function} onTitleChange - The function to call when the title changes
 * @param {function} onContentChange - The function to call when the content changes
 */
export default function NoteEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
}: NoteEditorProps) {
  return (
    <div className="mt-24 ml-36 flex h-full flex-col space-y-4 p-6">
      {/* Title Input */}
      <Input
        placeholder="Sans titre"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onTitleChange(e.target.value)
        }
        className="border-none text-5xl font-bold shadow-none focus-visible:ring-0"
        aria-label="Note Title"
      />
      {/* Content Textarea */}
      <Textarea
        placeholder="Écrivez votre note..."
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
