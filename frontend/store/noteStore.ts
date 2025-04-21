import { create } from 'zustand';

// Interface defining the structure of our state and its actions
interface NoteEditorState {
  selectedNoteId: number | null;
  editedTitle: string;
  editedContent: string;

  // Actions to modify the state
  setSelectedNoteId: (id: number | null) => void;
  setEditedTitle: (title: string) => void;
  setEditedContent: (content: string) => void;
  // Action to set title and content at once (useful for init/save)
  setEditorState: (title: string, content: string) => void;
  // Action to reset the editor (when no note is selected)
  resetEditorState: () => void;
}

/**
 * Create the store
 * @param set - The set function from the create function
 * @returns The store
 */
export const useNoteStore = create<NoteEditorState>((set) => ({
  // Initial state
  selectedNoteId: null,
  editedTitle: '',
  editedContent: '',

  // Implementation of actions
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  setEditedTitle: (title) => set({ editedTitle: title }),

  setEditedContent: (content) => set({ editedContent: content }),

  setEditorState: (title, content) =>
    set({ editedTitle: title, editedContent: content }),

  resetEditorState: () => set({ editedTitle: '', editedContent: '' }),
}));
