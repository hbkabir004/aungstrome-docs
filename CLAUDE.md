# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
pnpm dev          # Start development server at localhost:3000
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm start        # Start production server
```

## Architecture Overview

Aungstrome Docs is a Next.js 15 interview preparation app with offline-first storage and optional Google Drive sync. All data is stored client-side.

### Storage Layer (`lib/storage/`)

Uses a **strategy pattern** for pluggable storage backends:

- `index.ts` - Facade that delegates to the active backend
- `indexeddb.ts` - Primary storage using `idb` library with object stores for topics, qaItems, and snippets (indexed by `topicId`)
- `localstorage.ts` - Fallback implementation
- `settings.ts` - App settings stored separately in localStorage

Switch backends at runtime via `setStorageBackend()`. Components never import backends directly—always use the facade.

### Data Flow

```
Component → Hook (SWR) → Storage Facade → Active Backend
                ↓
         Google Drive Sync (optional)
```

**Hooks (`hooks/`):**
- `use-data.ts` - SWR-based hooks (`useTopics`, `useQAItems`, `useSnippets`) providing CRUD + caching
- `use-google-drive-sync.ts` - Manages OAuth lifecycle, auto-sync intervals, token expiration

**Google Drive (`lib/google-drive.ts`):**
- Browser-based OAuth 2.0 loading gapi.js and gis.js from CDN
- Sync uses merge strategy: items with latest `updatedAt` timestamp win
- Backup file stored in user's personal Drive

### Search (`lib/search.ts`)

Fuse.js fuzzy search with weighted fields. `searchAll()` returns heterogeneous results (QA items + snippets) with type discriminators.

### Core Types (`lib/types.ts`)

- `Topic` - Category container
- `QAItem` - Question/answer with difficulty, tags, YouTube links, notes
- `Snippet` - Code with language type, revision history (max 50)
- `AppData` - Root container for all content
- `AppSettings` - Preferences including storage backend choice

## Key Patterns

1. **Offline-first**: IndexedDB primary, sync optional
2. **Timestamp merge**: No manual conflict resolution—newer `updatedAt` wins
3. **SWR caching**: Automatic revalidation on mutations via `mutate()`
4. **Seed data**: `lib/seed-data.ts` hydrates on first load only

## Environment Variables (Optional)

For Google Drive sync:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
```
