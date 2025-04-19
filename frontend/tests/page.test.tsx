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
// Import 'rest' for MSW v1, no HttpResponse needed
import { rest } from 'msw';
import { setupServer } from 'msw/node';
// Import userEvent
import userEvent from '@testing-library/user-event';

import Home from '../app/page'; // Importe le composant à tester
import { Note } from '@/lib/api'; // Besoin du type Note pour le mock

// --- Configuration MSW ---
// Définit les "handlers" (intercepteurs) pour nos requêtes API
const initialHandlers = [
  // Use rest.get and res/ctx for MSW v1
  rest.get('*/api/v1/notes/', (req, res, ctx) => {
    console.log(
      'MSW: Intercepted GET /api/v1/notes/ - DEFAULT returning empty array'
    );
    return res(ctx.status(200), ctx.json([]));
  }),
  // --- Ajoute d'autres handlers ici si besoin pour d'autres tests ---
];

// Crée le serveur MSW pour l'environnement Node.js
const server = setupServer(...initialHandlers);

// Démarre le serveur avant tous les tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' })); // Erreur si une requête non mockée est faite

// Réinitialise les handlers après chaque test (bonne pratique)
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});

// Arrête le serveur après tous les tests
afterAll(() => server.close());
// --- Fin Configuration MSW ---

// --- Données Mockées ---
const mockNotes: Note[] = [
  {
    id: 1,
    title: 'First Mock Note',
    content: 'Content 1',
    created_at: '2024-01-01T10:00:00', // Format sans offset
    updated_at: '2024-01-02T11:00:00', // Format sans offset
  },
  {
    id: 2,
    title: 'Second Mock Note',
    content: 'Content 2',
    created_at: '2024-01-03T12:00:00',
    updated_at: null, // Test avec null
  },
];
// --- Fin Données Mockées ---

// --- Fonction Helper pour le Rendu ---
// Crée un nouveau QueryClient pour chaque test pour isoler les caches
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Désactive les retries automatiques pour les tests
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
// --- Fin Fonction Helper ---

// --- Les Tests ---
describe('Home Page', () => {
  it('should render the main title and placeholder when no notes are fetched', async () => {
    renderHomePage();

    // Attend que le contenu principal (y compris le titre) soit affiché
    await waitFor(() => {
      // Vérifie que le titre principal (h1) est là
      expect(
        screen.getByRole('heading', { name: /allonotes/i, level: 1 })
      ).toBeInTheDocument();

      // Vérifie que le message placeholder "Select a note..." est présent
      expect(
        screen.getByText(/select a note to view or edit/i)
      ).toBeInTheDocument();

      // Vérifie aussi que le message "No notes found" est dans la sidebar
      expect(screen.getByText(/no notes found/i)).toBeInTheDocument();

      // Optionnel : Vérifier que le spinner n'est plus là DANS le même check
      expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();
    });

    // On peut garder cette vérification hors du waitFor car l'erreur ne devrait jamais apparaître
    expect(screen.queryByText(/error fetching notes/i)).not.toBeInTheDocument();
  });

  it('should render the notes list when notes are fetched', async () => {
    // Surcharge le handler GET pour ce test spécifique
    server.use(
      rest.get('*/api/v1/notes/', (req, res, ctx) => {
        // Utilise rest et res/ctx
        console.log(
          'MSW: Intercepted GET /api/v1/notes/ - returning mock notes'
        );
        // Utilise HttpResponse.json si tu as la dépendance ou res(ctx.json(...)) sinon
        // Assumons res(ctx.json(...)) pour MSW v1
        return res(ctx.status(200), ctx.json(mockNotes));
      })
    );

    renderHomePage();

    // Attend que la liste des notes soit rendue (on cherche le titre de la première note)
    await waitFor(() => {
      expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
    });

    // Vérifie que les titres des deux notes sont présents
    expect(screen.getByText(mockNotes[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockNotes[1].title)).toBeInTheDocument();

    // Vérifie que le message "No notes found" n'est PAS présent
    expect(screen.queryByText(/no notes found/i)).not.toBeInTheDocument();

    // Le message "Select a note..." devrait toujours être là car rien n'est sélectionné
    expect(
      screen.getByText(/select a note to view or edit/i)
    ).toBeInTheDocument();

    // Vérifie que le spinner n'est plus là
    expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();

    // Vérifie qu'il n'y a pas d'erreur
    expect(screen.queryByText(/error fetching notes/i)).not.toBeInTheDocument();
  });

  // --- Nouveau Test : Sélection ---
  it('should display the selected note in the editor when clicked', async () => {
    // 1. Setup: Surcharge le handler pour retourner les notes mockées
    server.use(
      rest.get('*/api/v1/notes/', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockNotes));
      })
    );

    // Initialise userEvent
    const user = userEvent.setup();

    renderHomePage();

    // 2. Action: Attend que la première note soit visible et clique dessus
    const firstNoteItem = await screen.findByText(mockNotes[0].title);
    await user.click(firstNoteItem);

    // 3. Assertion: Attend que l'éditeur affiche le contenu de la note sélectionnée
    const titleInput = await screen.findByRole('textbox', {
      name: /note title/i,
    });
    const contentTextarea = await screen.findByRole('textbox', {
      name: /note content/i,
    });

    expect(titleInput).toHaveValue(mockNotes[0].title);
    expect(contentTextarea).toHaveValue(mockNotes[0].content);

    // Optionnel : Vérifier que l'autre note n'est pas affichée dans l'éditeur
    expect(titleInput).not.toHaveValue(mockNotes[1].title);
  });

  // --- New Test: Edit and Save ---
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

    // Optional: Verify the editor content reflects the saved state
    expect(titleInput).toHaveValue(updatedNoteData.title);
    expect(contentTextarea).toHaveValue(updatedNoteData.content);
  });

  // --- Test: Create Note (Corrected Structure) ---
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

  // --- New Test: Delete Note ---
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

    // No need to call confirmSpy.mockRestore(); if using vi.restoreAllMocks() in afterEach
  });

  // --- Add other tests here ---
});
