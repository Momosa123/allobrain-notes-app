import { Note } from '@/lib/api';
type NoteEditorProps = {
  selectedNote: Note | undefined;
};

export default function NoteEditor({ selectedNote }: NoteEditorProps) {
  if (!selectedNote) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Select a note or create a new one</p>
      </div>
    );
  }

  return (
    <div className="mt-24 ml-64 flex h-full flex-col p-6">
      <h1 className="mb-4 pb-2 text-6xl font-bold">{selectedNote.title}</h1>
      <div className="flex-1 overflow-y-auto pt-4">
        <div className="prose mx-auto">
          <p className="whitespace-pre-wrap">{selectedNote.content}</p>
        </div>
      </div>
    </div>
  );
}
