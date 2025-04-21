// frontend/__tests__/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import userEvent from '@testing-library/user-event';

import Home from '../app/page'; // Import component to test
import { Note } from '@/lib/api'; // Need Note type for mock

// --- Configuration MSW ---
// Define handlers (interceptors) for our API requests
const initialHandlers = [
  rest.get('*/api/v1/notes/', (req, res, ctx) => {
    console.log(
      'MSW: Intercepted GET /api/v1/notes/ - DEFAULT returning empty array'
    );
    return res(ctx.status(200), ctx.json([]));
  }),
];

// Create MSW server for Node.js environment
const server = setupServer(...initialHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // Error if an unmocked request is made

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});

// Stop server after all tests
afterAll(() => server.close());

// --- Mocked Data ---
const mockNotes: Note[] = [
  {
    id: 1,
    title: 'First Mock Note',
    content: 'Content 1',
    created_at: '2024-01-01T10:00:00',
    updated_at: '2024-01-02T11:00:00',
  },
  {
    id: 2,
    title: 'Second Mock Note',
    content: 'Content 2',
    created_at: '2024-01-03T12:00:00',
    updated_at: null, // Test with null
  },
];

// --- Helper Function for Rendering ---
// Create a new QueryClient for each test to isolate caches
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable automatic retries for tests
      },
    },
  });

const renderHomePage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
};

// --- The Tests ---
describe('Home Page', () => {
  it('should render the main title and placeholder when no notes are fetched', async () => {
    renderHomePage();

    // Wait for the main content (including the title) to be displayed
    await waitFor(() => {
      // Verify that the main title (h1) is present
      expect(
        screen.getByRole('heading', { name: /allonotes/i, level: 1 })
      ).toBeInTheDocument();

      // Verify that the placeholder message "Select a note..." is present
      expect(
        screen.getByText(/select a note to view or edit/i)
      ).toBeInTheDocument();

      // Also verify that the message "No notes found" is in the sidebar
      expect(screen.getByText(/no notes found/i)).toBeInTheDocument();

      //Verify that the spinner is not present in the same check
      expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();
    });

    expect(screen.queryByText(/error fetching notes/i)).not.toBeInTheDocument();
  });

  it('should render the notes list when notes are fetched', async () => {
    // Override the GET handler for this specific test
    server.use(
      rest.get('*/api/v1/notes/', (req, res, ctx) => {
        // Use rest and res/ctx
        console.log(
          'MSW: Intercepted GET /api/v1/notes/ - returning mock notes'
        );

        return res(ctx.status(200), ctx.json(mockNotes));
      })
    );

    renderHomePage();

    // Wait for the notes list to be rendered (find the title of the first note)
    await waitFor(() => {
      expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
    });

    // Verify that the titles of the two notes are present
    expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockNotes[1].title)).toBeInTheDocument();

    // Verify that the message "No notes found" is not present
    expect(screen.queryByText(/no notes found/i)).not.toBeInTheDocument();

    // The message "Select a note..." should always be present because nothing is selected
    expect(
      screen.getByText(/select a note to view or edit/i)
    ).toBeInTheDocument();

    // Verify that the spinner is not present
    expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();

    // Verify that there is no error
    expect(screen.queryByText(/error fetching notes/i)).not.toBeInTheDocument();
  });

  // --- Test: Selection ---
  it('should display the selected note in the editor when clicked', async () => {
    // 1. Setup: Override the handler to return the mocked notes
    server.use(
      rest.get('*/api/v1/notes/', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockNotes));
      })
    );

    // Initialise userEvent
    const user = userEvent.setup();

    renderHomePage();

    // 2. Action: Wait for the first note to be visible and click on it
    const firstNoteItem = await screen.findByText(mockNotes[0].title);
    await user.click(firstNoteItem);

    // 3. Assertion: Wait for the editor to display the selected note's content
    const titleInput = await screen.findByRole('textbox', {
      name: /note title/i,
    });
    const contentTextarea = await screen.findByRole('textbox', {
      name: /note content/i,
    });

    expect(titleInput).toHaveValue(mockNotes[0].title);
    expect(contentTextarea).toHaveValue(mockNotes[0].content);

    expect(titleInput).not.toHaveValue(mockNotes[1].title);
  });

  // --- Test: Edit and Save ---
  it('should enable save button on edit and save changes on click', async () => {
    // 1. Setup: Mock GET to return notes AND mock PUT for the update
    const updatedNoteData = {
      ...mockNotes[0],
      title: 'Updated Mock Title',
      content: 'Updated Content',
      updated_at: new Date().toISOString(), // Simulate updated timestamp
    };

    server.use(
      rest.get('*/api/v1/notes/', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockNotes));
      }),
      rest.put(`*/api/v1/notes/${mockNotes[0].id}`, async (req, res, ctx) => {
        console.log(`MSW: Intercepted PUT /api/v1/notes/${mockNotes[0].id}`);
        return res(ctx.status(200), ctx.json(updatedNoteData));
      })
    );

    const user = userEvent.setup();
    renderHomePage();

    // 2. Action: Select the first note
    const firstNoteItem = await screen.findByText(mockNotes[0].title);
    await user.click(firstNoteItem);

    // 3. Action: Edit title and content
    const titleInput = await screen.findByRole('textbox', {
      name: /note title/i,
    });
    const contentTextarea = await screen.findByRole('textbox', {
      name: /note content/i,
    });

    await user.clear(titleInput);
    await user.type(titleInput, updatedNoteData.title);
    await user.clear(contentTextarea);
    await user.type(contentTextarea, updatedNoteData.content);

    // 4. Assertion: Verify Save button is enabled
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).not.toBeDisabled();

    // 5. Action: Click Save button
    await user.click(saveButton);

    // 6. Assertion: Wait for save to complete and button to be disabled again
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });

    //  Verify the editor content reflects the saved state
    expect(titleInput).toHaveValue(updatedNoteData.title);
    expect(contentTextarea).toHaveValue(updatedNoteData.content);
  });

  // --- Test: Create Note ---
  it('should create a new note when the new note button is clicked', async () => {
    // 1. Setup: Define mock for the new note and specific MSW handlers
    const newMockNote: Note = {
      id: 99,
      title: 'Untitled',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let currentNotes = [...mockNotes]; // Start with existing notes for GET

    server.use(
      // GET handler specific for this test, uses mutable currentNotes
      rest.get('*/api/v1/notes/', (req, res, ctx) => {
        console.log('MSW: GET /api/v1/notes/ returning:', currentNotes);
        return res(ctx.status(200), ctx.json(currentNotes));
      }),
      // POST handler specific for this test
      rest.post('*/api/v1/notes/', async (req, res, ctx) => {
        console.log(
          'MSW: POST /api/v1/notes/ - adding & returning new mock note'
        );
        // Simulate adding to list for subsequent GET calls if query invalidation happens
        currentNotes = [newMockNote, ...currentNotes];
        return res(ctx.status(201), ctx.json(newMockNote));
      })
    );

    // 2. Render the component (only once)
    const user = userEvent.setup();
    renderHomePage();

    // 3. Action: Find and click the "New Note" button
    const newNoteButton = await screen.findByRole('button', {
      name: /new note/i,
    });
    await user.click(newNoteButton);

    // 4. Assertion: Wait for the new note title to appear in the sidebar
    // Query invalidation triggers GET, which now returns the updated currentNotes
    const newNoteTitleInSidebar = await screen.findByText(newMockNote.title, {
      selector: 'h3',
    });
    expect(newNoteTitleInSidebar).toBeInTheDocument();

    // 5. Assertion: Check if the editor displays the new note's content
    // Wait for editor to update after note creation and selection
    const titleInput = await screen.findByRole('textbox', {
      name: /note title/i,
    });
    const contentTextarea = await screen.findByRole('textbox', {
      name: /note content/i,
    });

    // Verify the *single* editor instance has the correct value
    expect(titleInput).toHaveValue(newMockNote.title);
    expect(contentTextarea).toHaveValue(newMockNote.content);
  });

  // --- Test: Delete Note ---
  it('should delete the selected note when delete is confirmed', async () => {
    // 1. Setup: Mock GET to return notes and mock DELETE for the specific note
    const noteToDelete = mockNotes[0];
    let currentNotes = [...mockNotes]; // Mutable list for GET simulation

    server.use(
      rest.get('*/api/v1/notes/', (req, res, ctx) => {
        console.log('MSW: GET /api/v1/notes/ returning:', currentNotes);
        return res(ctx.status(200), ctx.json(currentNotes));
      }),
      rest.delete(`*/api/v1/notes/${noteToDelete.id}`, (req, res, ctx) => {
        console.log(`MSW: Intercepted DELETE /api/v1/notes/${noteToDelete.id}`);
        currentNotes = currentNotes.filter(
          (note) => note.id !== noteToDelete.id
        );
        return res(ctx.status(204)); // Return 204 No Content
      })
    );

    // Mock window.confirm to automatically confirm
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true);

    const user = userEvent.setup();
    renderHomePage();

    // 2. Action: Select the note to delete
    const noteItemToDelete = await screen.findByText(noteToDelete.title);
    await user.click(noteItemToDelete);

    // Ensure editor is populated before trying to delete
    await screen.findByRole('textbox', { name: /note title/i });

    // 3. Action: Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete note/i });
    await user.click(deleteButton);

    // 4. Assertion: Check if window.confirm was called
    expect(confirmSpy).toHaveBeenCalledTimes(1);

    // 5. Assertion: Wait for the note title to disappear from the sidebar
    await waitFor(() => {
      expect(screen.queryByText(noteToDelete.title)).not.toBeInTheDocument();
    });

    // 6. Assertion: Verify the editor is now showing the placeholder
    expect(
      screen.getByText(/select a note to view or edit/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: /note title/i })
    ).not.toBeInTheDocument();
  });
});
