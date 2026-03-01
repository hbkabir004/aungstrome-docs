# Google Drive Sync — Implementation Guide

This document describes how **Google Drive backup and sync** is implemented in this project so you can reuse it in another app. The implementation is **browser-only**: no backend is required. It uses Google Identity Services (GIS) for OAuth and the Drive API via the JavaScript client.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Google Cloud Setup](#google-cloud-setup)
5. [Environment Variables](#environment-variables)
6. [Data Types](#data-types)
7. [Core API Layer](#core-api-layer)
8. [Script Loading & Initialization](#script-loading--initialization)
9. [Authentication](#authentication)
10. [Drive Operations](#drive-operations)
11. [Sync Strategy](#sync-strategy)
12. [Token Refresh & Session](#token-refresh--session)
13. [Settings & Config Persistence](#settings--config-persistence)
14. [React Hook & UI](#react-hook--ui)
15. [Error Handling](#error-handling)
16. [Offline & Reconnect](#offline--reconnect)
17. [Checklist for Another App](#checklist-for-another-app)

---

## Overview

- **What it does**: Backs up app data to a single JSON file in the user’s Google Drive. Supports **Sync** (merge local + remote), **Upload** (overwrite remote with local), and **Restore** (overwrite local with remote). Optional **auto-sync** at a configurable interval.
- **Auth**: OAuth 2.0 via [Google Identity Services](https://developers.google.com/identity/gsi/web) (GIS). No refresh token is stored; access tokens expire (~1 hour). When expired, the user must **reconnect** (or we attempt a silent refresh).
- **APIs**: Drive API v3 (files list/create, get, update via PATCH). Scripts loaded from CDN: `api.js` (gapi) and GSI client.

---

## Prerequisites

- A **Google Cloud project** with the Drive API and OAuth consent configured.
- **OAuth 2.0 Client ID** (e.g. “Web application”) with authorized JavaScript origins and redirect URIs set.
- **API Key** (optional for some calls; used here for gapi client init).
- Your app can **export** and **import** its data as a single JSON object (e.g. `exportData()` / `importData()`).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  UI (e.g. Settings)                                              │
│  - Connect / Disconnect / Sync / Upload / Restore                 │
│  - Auto-sync toggle, interval, last sync time                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  useGoogleDriveSync (React hook)                                   │
│  - Config state, sync status, connect/disconnect/sync/upload/     │
│    restore, auto-sync interval, token refresh, offline handling   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  lib/google-drive.ts (core API)                                   │
│  - initGoogleAPI, authenticateGoogleDrive, upload, download,     │
│    sync (merge), disconnect, token expiry, silent refresh         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Settings storage (e.g. localStorage)                             │
│  - GoogleDriveConfig (accessToken, expiresAt, email, fileId)      │
│  - AppSettings (autoSync, syncInterval)                           │
└─────────────────────────────────────────────────────────────────┘
```

- **Config** (including `accessToken`, `expiresAt`, `email`, `fileId`) is persisted in your settings store (e.g. localStorage).
- **Sync status** (isSyncing, lastSyncAt, error) can be in React state and optionally persisted (e.g. localStorage) for “last sync” display.

---

## Google Cloud Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select or create a project.
2. **Enable APIs**:  
   **APIs & Services → Library** → enable **Google Drive API**.
3. **OAuth consent screen**:  
   **APIs & Services → OAuth consent screen** → configure (External or Internal), add scopes (see below).
4. **Credentials**:
   - **Create OAuth 2.0 Client ID** (Web application).  
     Add your app origins (e.g. `http://localhost:3000`, `https://yourdomain.com`) to **Authorized JavaScript origins**.  
     Redirect URI is not used for the token client flow; you can leave default or add your production URL.
   - Create an **API Key** (optional but recommended for gapi client init). Restrict by HTTP referrer if desired.
5. **Scopes** used in this implementation:
   - `openid email profile` — to get user email.
   - `https://www.googleapis.com/auth/drive.file` — per-file access to files created/opened by the app (recommended for least privilege).

---

## Environment Variables

In this project:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes (for Drive) | OAuth 2.0 Web Client ID |
| `NEXT_PUBLIC_GOOGLE_API_KEY`   | Yes (for gapi)  | API Key for Drive API client |

Use the same names or your own (e.g. `VITE_GOOGLE_CLIENT_ID` for Vite). The core layer should read from one place (env or config).

---

## Data Types

Define these (or equivalents) in your app:

```ts
// Config persisted after connect
interface GoogleDriveConfig {
  accessToken: string
  expiresAt: number   // Unix ms
  email: string
  fileId?: string     // Drive file ID of the backup file
}

// Optional: refresh token if you switch to a backend or offline flow
// refreshToken?: string

// Sync status (UI + optional persistence)
interface SyncStatus {
  isSyncing: boolean
  lastSyncAt?: number
  error?: string
}

// Your app’s backup payload (adapt to your domain)
interface AppData {
  // e.g. topics: Topic[]; qaItems: QAItem[]; snippets: Snippet[]
  [key: string]: any
}
```

---

## Core API Layer

The core file (e.g. `lib/google-drive.ts`) should provide:

### 1. Script loading and gapi init

- Load **gapi**: `https://apis.google.com/js/api.js`
- Load **GIS**: `https://accounts.google.com/gsi/client`
- After gapi loads, call `gapi.load('client', ...)` and then:

  ```ts
  await gapi.client.init({
    apiKey: GOOGLE_API_KEY,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  })
  ```

- Ensure scripts are only appended once and you wait for `window.gapi` and `window.google.accounts.oauth2` before using them.

### 2. Constants

```ts
const SCOPES = 'openid email profile https://www.googleapis.com/auth/drive.file'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
const BACKUP_FILENAME = 'your-app-backup.json'  // or from config
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000   // 5 min before expiry
```

### 3. Authentication

- Use **Google Identity Services** token client (no redirect; popup-based):

  ```ts
  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (response) => { /* handle response */ },
    error_callback: (err) => { /* handle error */ },
  })
  tokenClient.requestAccessToken({ prompt: 'consent' })
  ```

- On success: set the token on gapi (`gapi.client.setToken({ access_token })`), then optionally call `https://www.googleapis.com/oauth2/v3/userinfo` with `Authorization: Bearer <token>` to get `email`.
- Build `GoogleDriveConfig`: `{ accessToken, expiresAt: Date.now() + expires_in * 1000, email, fileId?: undefined }`.

**Important**: Trigger `requestAccessToken` from a **user gesture** (e.g. “Connect” button click) so the popup is not blocked.

### 4. Find or create the backup file

- **List**: `gapi.client.drive.files.list({ q: "name='...' and trashed=false", spaces: 'drive', fields: 'files(id, name)' })`.
- If a file exists, use `files[0].id` as `fileId`.
- If not, **create**: `gapi.client.drive.files.create({ resource: { name: BACKUP_FILENAME, mimeType: 'application/json' }, fields: 'id' })` and use `result.id`.

### 5. Upload

- Use **REST PATCH** with the access token so the body is sent as raw JSON (gapi sometimes serializes incorrectly):

  ```ts
  await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data, null, 2),
    }
  )
  ```

- On 401/403 treat as token expired; on 404 treat as file missing (re-find or create).

### 6. Download

- Either:
  - `gapi.client.drive.files.get({ fileId, alt: 'media' })` and use `response.result`, or
  - `fetch(\`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media\`, { headers: { Authorization: \`Bearer ${config.accessToken}\` } })` and parse JSON.

### 7. Sync (merge strategy)

- Download remote data.
- If no remote file, upload local and return.
- Otherwise **merge** local and remote (e.g. by `id` and `updatedAt`), then upload the merged result and optionally apply it locally (e.g. call `importData(merged)`).

Example merge (keep latest by `updatedAt`):

```ts
function mergeByLatest<T extends { id: string; updatedAt: number }>(
  local: T[],
  remote: T[]
): T[] {
  const merged = new Map<string, T>()
  remote.forEach((item) => merged.set(item.id, item))
  local.forEach((item) => {
    const existing = merged.get(item.id)
    if (!existing || item.updatedAt > existing.updatedAt) merged.set(item.id, item)
  })
  return Array.from(merged.values())
}
```

### 8. Disconnect

- Clear token: `gapi.client.setToken(null)`.
- Clear persisted config (e.g. set `googleDrive` to `null` in settings). Do not revoke the token on the server unless you have a backend; the token will expire.

### 9. Token expiry and silent refresh

- **Expired**: `Date.now() >= config.expiresAt - TOKEN_EXPIRY_BUFFER_MS`.
- **Silent refresh**: Call `initTokenClient` again and `requestAccessToken({ prompt: '' })`. If the user’s session is still valid, GIS may return a new token without a popup. If it fails, require the user to click “Reconnect” (same as connect flow).

---

## Settings & Config Persistence

- **GoogleDriveConfig**: Stored wherever you keep app settings (e.g. localStorage key `app-settings` with a `googleDrive` field). Do **not** log or send the access token to your backend unless you have a dedicated token endpoint.
- **App settings**: e.g. `autoSync: boolean`, `syncInterval: number` (minutes). Persist and read on load so the hook can start the auto-sync interval when `config` and `autoSync` are set.

---

## React Hook & UI

The hook (e.g. `useGoogleDriveSync`) should:

1. **On mount**: Load config and settings from storage; call `initGoogleAPI()` (don’t await inside a user-gesture path so Connect can open the popup). If config exists and token is not expired, call `gapi.client.setToken({ access_token: config.accessToken })` to restore session.
2. **Connect**: Call `authenticateGoogleDrive()`, then run initial sync (e.g. `syncWithGoogleDrive(config, localData)`), save config with `fileId`, then `importData(merged)` and show success.
3. **Sync**: If offline, set a “pending sync” flag and return. If token expired, try silent refresh; if that fails, set `needsReconnect` and return. Then run sync, update config if `fileId` changed, call `importData(merged)`, update `lastSyncAt` and clear error.
4. **Upload backup**: Same token/offline checks; then `uploadToGoogleDrive(config, exportData())`, update `fileId` if new file, update `lastSyncAt`.
5. **Restore backup**: Download; if no file, show “No backup found”; else `importData(remoteData)` and update `lastSyncAt`.
6. **Disconnect**: Call `disconnectGoogleDrive()`, clear config from storage, clear sync status.
7. **Auto-sync**: When `config` and `autoSync` are set, run a `setInterval` that calls the sync function every `syncInterval` minutes (and only when online and not already syncing). Store the sync function in a ref so the interval always calls the latest version.
8. **Online/offline**: Listen to `online` / `offline`. When coming back online, if a “pending sync” flag is set, run sync once.

Expose from the hook: `config`, `syncStatus`, `isConnected`, `isOffline`, `needsReconnect`, `connect`, `reconnect`, `disconnect`, `sync`, `uploadBackup`, `restoreBackup`, `toggleAutoSync`, `setSyncInterval`.

---

## Error Handling

- Define a small **GoogleDriveError** (or similar) with a `code`: e.g. `OFFLINE`, `TOKEN_EXPIRED`, `NETWORK_ERROR`, `API_ERROR`, `NOT_FOUND`.
- Map 401/403 to `TOKEN_EXPIRED`, 404 to `NOT_FOUND`, and network failures to `NETWORK_ERROR` or `OFFLINE`.
- In the hook, handle `TOKEN_EXPIRED` by setting `needsReconnect` and showing a “Reconnect” button; handle `OFFLINE` by setting a pending-sync flag and showing an offline message.

---

## Offline & Reconnect

- Use `navigator.onLine` and `online` / `offline` events to set `isOffline`.
- When sync fails because offline, set a “pending sync” flag (e.g. in localStorage). When the app goes online again, run sync once and clear the flag.
- When the token is expired and silent refresh fails, show “Session expired” and a “Reconnect” button that runs the same flow as “Connect” (open token client with `prompt: 'consent'`).

---

## Checklist for Another App

- [ ] Google Cloud: Drive API enabled, OAuth consent, Web client ID, API key.
- [ ] Env: `GOOGLE_CLIENT_ID`, `GOOGLE_API_KEY` (or your naming).
- [ ] Load `api.js` and GSI client; init gapi with API key and Drive discovery doc.
- [ ] Implement `authenticateGoogleDrive()` with GIS token client and userinfo for email.
- [ ] Implement `getOrCreateBackupFile()` (list by name, create if missing).
- [ ] Implement upload via `fetch` PATCH to `.../upload/drive/v3/files/{id}?uploadType=media` with Bearer token and JSON body.
- [ ] Implement download (get file with `alt: 'media'` or fetch with `alt=media`).
- [ ] Implement merge strategy and `syncWithGoogleDrive(config, localData)`.
- [ ] Persist `GoogleDriveConfig` (accessToken, expiresAt, email, fileId) and restore token on load.
- [ ] Implement token expiry check and optional silent refresh; show “Reconnect” when refresh fails.
- [ ] Implement disconnect (clear gapi token and persisted config).
- [ ] Hook: connect, sync, upload, restore, disconnect, auto-sync interval, online/offline and pending sync.
- [ ] UI: Connect / Disconnect, Sync / Upload / Restore, auto-sync toggle and interval, last sync time, errors and “Reconnect” when expired.

---

## File Reference (this project)

| File | Purpose |
|------|---------|
| `lib/google-drive.ts` | Script load, gapi init, auth, upload/download/sync, token expiry, disconnect |
| `hooks/use-google-drive-sync.ts` | React hook: config, sync status, connect/disconnect/sync/upload/restore, auto-sync, offline |
| `lib/storage/settings.ts` | Persist `GoogleDriveConfig` and app settings (autoSync, syncInterval) |
| `lib/types.ts` | `GoogleDriveConfig`, `SyncStatus`, `AppData` |
| `components/google-drive-sync.tsx` | Settings UI: connect button, status, sync/upload/restore, auto-sync, disconnect dialog |

Copy and adapt these to your app’s data shape, settings store, and UI framework.
