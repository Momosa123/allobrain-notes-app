import { Note } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';

type NoteSidebarProps = {
  notes: Note[] | undefined;
  selectedNoteId: number | null;
  onSelectNote: (noteId: number) => void;
  isLoading: boolean;
};
/*
  NoteSidebar component that displays a list of notes
 */
export default function NoteSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  isLoading,
}: NoteSidebarProps) {
  return (
    <ScrollArea className="flex-1 bg-gray-100">
      <h2 className="p-4 text-4xl font-semibold">AlloNotes</h2>

      <div className="space-y-2 p-4">
        {notes && notes.length > 0
          ? notes.map((note) => (
              <div
                key={note.id}
                className={`cursor-pointer rounded border p-2 ${
                  selectedNoteId === note.id
                    ? 'border-gray-300 bg-gray-200'
                    : 'border-transparent hover:bg-gray-50'
                }`}
                onClick={() => onSelectNote(note.id)}
              >
                <h3 className="truncate font-medium">{note.title}</h3>
                <p className="text-sm text-gray-500">{note.content}</p>
              </div>
            ))
          : !isLoading && (
              <p className="py-4 text-center text-sm text-gray-500">
                No notes found
              </p>
            )}
        {isLoading && (
          <p className="py-4 text-center text-sm text-gray-500">Loading...</p>
        )}
      </div>
    </ScrollArea>
  );
}
