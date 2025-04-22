# AlloNotes - Application de Prise de Notes Versionnée

![AlloNotes Demo](placeholder.gif) <!-- Optionnel: Tu peux ajouter un GIF de démo ici si tu veux -->

## Sommaire

- [Description](#description)
- [Fonctionnalités Implémentées](#fonctionnalités-implémentées)
- [Stack Technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation et Lancement (via Docker)](#installation-et-lancement-via-docker)
- [Structure du Projet](#structure-du-projet)
- [Choix Techniques et Justifications](#choix-techniques-et-justifications)
- [Pistes d'Amélioration Possibles](#pistes-damélioration-possibles)

## Description

AlloNotes est une application web full-stack (React + FastAPI) inspirée de Notion et Note de Apple, qui permet à un utilisateur de rédiger des notes tout en gardant l’historique complet des modifications. Chaque édition est versionnée et peut être comparée ou restaurée, comme dans un système de contrôle de version simplifié.

## Fonctionnalités Implémentées

- Affichage de la liste des notes existantes.
- Création d'une nouvelle note (Titre + Contenu).
- Modification d'une note existante.
- Suppression d'une note (avec confirmation).
- Consultation de l'historique des versions pour une note sélectionnée.
- Prévisualisation du contenu d'une ancienne version.
- Comparaison visuelle ("diff") entre une ancienne version et la version actuelle (titre et contenu).
- Restauration d'une note à une version précédente.

---

## Stack Technique

- **Frontend:**
  - Framework: [Next.js](https://nextjs.org/) (React avec TypeScript)
  - Styling: [Tailwind CSS](https://tailwindcss.com/)
  - Composants UI: [Shadcn/ui](https://ui.shadcn.com/)
  - Gestionnaire de formulaires: [React Hook Form](https://react-hook-form.com/)
  - Gestion de l'état serveur (cache API): [TanStack Query (React Query)](https://tanstack.com/query/latest)
  - Gestion de l'état client: [Zustand](https://zustand-demo.pmnd.rs/)
  - Gestionnaire de paquets: [pnpm](https://pnpm.io/)
- **Backend:**
  - Framework: [FastAPI](https://fastapi.tiangolo.com/) (Python)
  - Base de données: [SQLite](https://www.sqlite.org/index.html)
  - ORM / Migration: [SQLAlchemy](https://www.sqlalchemy.org/) & [Alembic](https://alembic.sqlalchemy.org/en/latest/)
  - Validation des données: [Pydantic](https://docs.pydantic.dev/latest/)
- **Conteneurisation:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## Prérequis

- [Docker](https://www.docker.com/products/docker-desktop/) (Docker Desktop recommandé) installé et démarré.

## Installation et Lancement (via Docker)

1.  **Cloner le dépôt :**

    ```bash
    git clone https://github.com/Momosa123/allobrain-notes-app.git
    cd allobrain-notes-app
    ```

2.  **Lancer l'application avec Docker Compose :**

    ```bash
    docker-compose up --build
    ```

    - La première fois, Docker construira les images pour le frontend et le backend (cela peut prendre quelques minutes).
    - Les fois suivantes, vous pouvez utiliser `docker-compose up`.

3.  **Accéder à l'application :**

    - Ouvrez votre navigateur et allez sur `http://localhost:3000`.

4.  **Arrêter l'application :**
    - Retournez dans le terminal où `docker-compose up` s'exécute et appuyez sur `Ctrl + C`.

---

## Structure du Projet avec fichiers principaux

```plaintext
allobrain-notes-app/
├── backend/                     # Code source du backend FastAPI
│   ├── app/                     # Logique de l'application (peut varier)
│   ├── alembic/                 # Fichiers de migration Alembic
│   ├── alembic.ini              # Configuration Alembic
│   ├── Dockerfile               # Recette Docker pour le backend
│   ├── main.py                  # Point d'entrée FastAPI
│   └── requirements-dev.txt     # Dépendances Python
│   └── requirements.txt         # Dépendances Python
├── frontend/                    # Code source du frontend Next.js
│   ├── components/              # Composants React réutilisables
│   ├── hooks/                   # Hooks personnalisés
│   ├── lib/                     # Utilitaires, types, etc.
│   ├── app/                     # Structure de routing Next.js App Router (ou pages/)
│   ├── public/                  # Fichiers statiques
│   ├── Dockerfile               # Recette Docker multi-étapes pour le frontend
│   ├── package.json             # Dépendances et scripts Node.js
│   └── pnpm-lock.yaml           # Lockfile pnpm
├── docker-compose.yml           # Fichier d'orchestration Docker Compose
└── README.md                    # Documentation du projet
```

---

## Choix Techniques et Justifications

### Backend

- **FastAPI**
  Framework moderne et performant, basé sur les standards Python (type hints, OpenAPI, ASGI), qui permet de créer rapidement des APIs REST robustes. Il propose une auto-documentation interactive (Swagger UI), ce qui facilite le test et la collaboration.

- **SQLAlchemy + Alembic**
  ORM flexible et robuste, reconnu dans l'écosystème Python. Alembic permet une gestion propre des migrations de schéma.

- **SQLite**
  Base de données légère et sans configuration, parfaite pour un projet de cette taille. Elle permet un stockage local persistant sans avoir besoin de serveur de base de données dédié.

- **Modélisation du versionnement**
  Chaque modification d'une note est enregistrée dans une table `NoteVersion`, séparée de la table `Note`, permettant un historique complet, des rollbacks faciles et un affichage clair des versions.

- **Validation via Pydantic**
  Toutes les données entrantes sont validées à l'aide de Pydantic, ce qui garantit la cohérence des types, permet une gestion propre des erreurs, et simplifie la sérialisation des objets.

#### Architecture Backend

- **Séparation des Couches :** L'architecture sépare la couche API (dans `routers/notes_router.py`), gérant les requêtes/réponses HTTP, de la couche d'accès aux données et logique métier (`crud/note.py`). Cette modularité améliore la testabilité et la maintenabilité.

- **Modèle de Versionnement :** Une table `NoteVersion` dédiée enregistre l'état d'une note avant chaque modification. La relation `one-to-many` via une clé étrangère entre `Note` et `NoteVersion` (`models/note.py`, `models/note_version.py`) permet un historique complet. Le CRUD (`crud/note.py`) gère la création automatique des versions lors des mises à jour, assurant la traçabilité et la restauration.

### Frontend

- **Next.js + TypeScript**
  Next.js offre un routage intégré, un build optimisé et la flexibilité du Server-Side Rendering (SSR) si besoin. Combiné à TypeScript, cela renforce la qualité et la maintenabilité du code.

- **Tailwind CSS**
  Permet un design rapide et cohérent avec une approche utilitaire, tout en laissant une grande liberté de personnalisation.

- **shadcn/ui**
  Fournit une base de composants accessibles et élégants, directement et facilement intégrables au projet.

- **TanStack Query (React Query)**
  Gère efficacement le **fetching, le caching, la synchronisation et les mutations des données serveur**. Elle offre une UX fluide (chargement, erreurs, actualisation automatique) et permet des mutations optimistes, pour une meilleure réactivité de l’interface.

- **Zustand**
  Utilisé pour la gestion de quelques **états globaux non liés aux données serveur**, comme la sélection courante d'une note. Zustand est léger, simple, et performant.

- **react-diff-viewer**
  Pour l'affichage des différences entre deux versions de notes, j'ai utilisé `react-diff-viewer`, une librairie intuitive qui permet de visualiser facilement les ajouts, suppressions et modifications ligne par ligne, façon "git diff simplifié".

#### Architecture Frontend

- **Orchestration via `page.tsx` et Hooks :** Le composant principal (`app/page.tsx`) orchestre l'interface en utilisant des hooks personnalisés pour séparer les préoccupations : `useNoteManager` (logique métier principale), `useNoteVersionsQuery` (données d'historique), hooks UI (`useDiffDialog`, `usePreviewDialog`, `useHistoryPanel`) et `useUnsavedChangesGuard`. Cette composition favorise la modularité et la clarté de la gestion de l'état.
- **Layout Composé (`NoteLayout.tsx`) :** Un composant `NoteLayout` dédié est utilisé pour définir la structure visuelle principale de la page (Sidebar, Zone d'édition avec Action Bar, Panneaux/Dialogues optionnels). Il reçoit les différentes parties de l'UI comme des props (`sidebar`, `editor`, etc.), permettant une composition claire et une réutilisation potentielle de la structure.
- **Gestion Centralisée Chargement/Erreur (`QueryBoundary.tsx`) :** Le composant `QueryBoundary` encapsule la logique d'affichage des états de chargement initiaux et des erreurs principales des requêtes (via les props `isLoading`, `isError`, `error` issues de React Query). Il permet de centraliser cet affichage et d'éviter la répétition de cette logique dans les composants de page.

#### Qualité du Code et Automatisation

Pour garantir une base de code propre, cohérente et robuste, les outils et processus suivants ont été mis en place :

- **Frontend (TypeScript/Next.js) :**
  - **Linting & Formatting :** [ESLint](https://eslint.org/) et [Prettier](https://prettier.io/) sont configurés pour assurer le respect des règles de style et détecter les erreurs potentielles dans le code TypeScript/React.
  - **Hooks Pre-commit :** [Husky](https://typicode.github.io/husky/) et [lint-staged](https://github.com/okonet/lint-staged) sont utilisés pour exécuter automatiquement ESLint et Prettier sur les fichiers modifiés avant chaque commit. Cela garantit que seul du code formaté et sans erreurs de linting est ajouté au dépôt.
- **Backend (Python/FastAPI) :**
  - **Formatting :** [Black](https://github.com/psf/black) est utilisé pour un formatage de code automatique et cohérent. [isort](https://pycqa.github.io/isort/) trie automatiquement les imports.
  - **Linting :** [Flake8](https://flake8.pycqa.org/en/latest/) est utilisé pour détecter les erreurs de style et les problèmes de logique potentiels.
  - **Hooks Pre-commit :** Le framework [pre-commit](https://pre-commit.com/) est configuré (via `.pre-commit-config.yaml`) pour exécuter automatiquement Black, isort et Flake8 avant chaque commit sur les fichiers Python modifiés.
- **Intégration Continue (CI/CD) :**
  - **GitHub Actions :** Un workflow d'intégration continue est configuré (dans `.github/workflows/`) pour :
    - Exécuter les linters et les formatters (pour vérifier la cohérence).
    - Lancer les tests d'intégration backend et frontend.
  - Ce pipeline peut être déclenché sur les pushs et les Pull Requests vers la branche `main`, assurant que les modifications n'introduisent pas de régressions ou de problèmes de qualité.

L'utilisation de ces outils garantit une meilleure qualité de code, réduit les erreurs humaines et automatise les vérifications répétitives.

#### Tests d'Intégration

- Des tests d'intégration ont été mis en place pour valider les fonctionnalités clés :

  - **Backend :** Les tests (situés dans `backend/tests/`, utilisant Pytest et TestClient) vérifient le comportement des endpoints API principaux (CRUD des notes, versioning), assurant leur bon fonctionnement avec la logique métier et la base de données de test.

  - **Frontend :** Le test (`frontend/tests/page.test.tsx`, utilisant Jest et React Testing Library) couvre le rendu et les interactions de base de certains composants de la page principale, garantissant l'intégration correcte des différents éléments de l'UI et des hooks associés (avec API mockée).

- Ces tests aident à prévenir les régressions et à garantir la fiabilité des fonctionnalités développées.

### Déploiement et DevOps

- **Docker + Docker Compose**
  Tous les services (backend, base de données, frontend) sont conteneurisés pour assurer la portabilité et la reproductibilité de l’environnement.
  - Utilisation d’images multi-étapes pour Next.js, afin de générer une image optimisée et légère.
  - Le fichier `docker-compose.yml` permet un démarrage en une seule commande, facilitant l’onboarding et les tests.

Ces choix techniques ont été motivés par des critères de simplicité, de performance, de maintenabilité et d'expérience développeur.

---

## Pistes d'Amélioration Possibles

- **Authentification/Utilisateurs:** Ajouter une gestion des utilisateurs pour que chacun ait ses propres notes notamment pour la mise en production.
- **Optimisations UI/UX:** Peaufiner l'interface, Rendre l'application responsive, amélioration de l'UI des messages d'alerte, landing page, ne pas autoriser l'enregistrement de la note initial, transitions, utilisation d'un éditeur de texte enrichi.
- **Tests:** Ajouter une couverture de tests plus complète (unitaires, end to end) pour le backend et le frontend.
- **Prise de notes par voix:** Permettre à l'utilisateur de dicter vocalement des notes via un module Speech-To-Text
- **Système de RAG**: Pouvoir rechercher une note et aussi créer une base de connaissance pour une IA et permettre à l'utilisateur de pouvoir discuter avec une IA au sujet de ses notes.
- **Faire un PWA:** Permettre à l'utilisateur de pouvoir télécharger l'application sur son PC en faisant une PWA (Progressive Web App) avec le frontend
