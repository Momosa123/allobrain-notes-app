// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Nécessaire si tu utilises React/JSX dans les tests
import tsconfigPaths from 'vite-tsconfig-paths'; // <-- Importer le plugin

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // <-- Ajouter le plugin ici
  ],
  test: {
    globals: true, // Pas besoin d'importer `it`, `describe`, `expect` etc.
    environment: 'jsdom', // Utilise jsdom pour simuler le DOM
    setupFiles: './vitest.setup.ts', // Fichier de configuration globale pour les tests
    // Optionnel : Inclure seulement les fichiers se terminant par .test.ts(x) ou .spec.ts(x)
    // include: ['**/*.{test,spec}.{ts,tsx}'],
    // Optionnel : Ignorer node_modules, dist, etc.
    // exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    css: false, // On n'a généralement pas besoin de traiter le CSS dans les tests unit/integration
  },
});
