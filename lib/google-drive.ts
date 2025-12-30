// Google Drive API integration for backup and sync (browser-based)
import type { AppData, GoogleDriveConfig, SyncStatus } from "./types"

// Browser-based Google API types
declare global {
  interface Window {
    gapi: any
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: any) => void
            error_callback?: (error: any) => void
          }) => {
            callback: (response: any) => void
            requestAccessToken: (options: { prompt: string }) => void
          }
          revoke: (token: string, callback?: () => void) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""
// Include user identity scopes so we can fetch email reliably
const SCOPES = "openid email profile https://www.googleapis.com/auth/drive.file"
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
const BACKUP_FILENAME = "aungstrome-docs-backup.json"

// Buffer time before actual expiration (5 minutes)
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000

let gapiInited = false
let gisInited = false
let gapi: any = null
let initPromise: Promise<void> | null = null
let isRefreshing = false
let refreshPromise: Promise<GoogleDriveConfig | null> | null = null

// Load a script and return a promise
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

// Initialize Google API
export async function initGoogleAPI(): Promise<void> {
  if (typeof window === "undefined") return

  // Return existing promise if already initializing
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      // Load both scripts in parallel
      await Promise.all([
        loadScript("https://apis.google.com/js/api.js"),
        loadScript("https://accounts.google.com/gsi/client"),
      ])

      // Initialize gapi if not already done
      if (!gapiInited) {
        gapi = window.gapi
        await new Promise<void>((resolve, reject) => {
          gapi.load("client", async () => {
            try {
              await gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
              })
              gapiInited = true
              resolve()
            } catch (error) {
              reject(error)
            }
          })
        })
      }

      // Mark GIS as initialized if available (token client will be created on-demand)
      if (!gisInited && window.google?.accounts?.oauth2) {
        gisInited = true
      }
    } catch (error) {
      initPromise = null // Allow retry on failure
      throw error
    }
  })()

  return initPromise
}

// Restore access token to gapi client (call after page refresh with existing config)
export async function restoreAccessToken(config: GoogleDriveConfig): Promise<boolean> {
  if (isTokenExpired(config)) {
    return false
  }

  await initGoogleAPI()

  if (gapi?.client) {
    gapi.client.setToken({ access_token: config.accessToken })
    return true
  }

  return false
}

// Authenticate with Google Drive
export async function authenticateGoogleDrive(): Promise<GoogleDriveConfig> {
  if (!gapiInited || !gisInited) {
    await initGoogleAPI()
  }

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services not loaded")
  }

  return new Promise((resolve, reject) => {
    // Create token client on-demand with the callback (GIS requires callback at init time)
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (response: any) => {
        if (response.error) {
          reject(new Error(response.error))
          return
        }

        try {
          // Set access token before any authenticated requests
          setAccessToken(response.access_token)

          // Get user info using OAuth bearer token (avoid API key-only requests)
          const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${response.access_token}` },
          })
          if (!userInfoRes.ok) {
            const errText = await userInfoRes.text()
            throw new Error(`Failed to fetch user info: ${userInfoRes.status} ${errText}`)
          }
          const userInfo = await userInfoRes.json()

          const config: GoogleDriveConfig = {
            accessToken: response.access_token,
            expiresAt: Date.now() + (response.expires_in || 3600) * 1000,
            email: userInfo.email,
          }

          resolve(config)
        } catch (error) {
          reject(error)
        }
      },
      error_callback: (error: any) => {
        reject(new Error(error.message || "Authentication failed"))
      },
    })

    tokenClient.requestAccessToken({ prompt: "consent" })
  })
}

// Set access token for API calls
function setAccessToken(token: string) {
  if (!gapi?.client) {
    console.error("gapi.client not initialized")
    return
  }
  gapi.client.setToken({ access_token: token })
}

// Ensure gapi is ready and token is set before making API calls
async function ensureAuthenticated(config: GoogleDriveConfig): Promise<void> {
  if (!gapiInited) {
    await initGoogleAPI()
  }
  if (!gapi?.client) {
    throw new Error("Google API client not initialized")
  }
  gapi.client.setToken({ access_token: config.accessToken })
}

// Check if token is expired (with buffer time)
export function isTokenExpired(config: GoogleDriveConfig): boolean {
  return Date.now() >= config.expiresAt - TOKEN_EXPIRY_BUFFER_MS
}

// Check if token is actually expired (no buffer)
export function isTokenActuallyExpired(config: GoogleDriveConfig): boolean {
  return Date.now() >= config.expiresAt
}

// Check if we're online
export function isOnline(): boolean {
  if (typeof window === "undefined") return true
  return navigator.onLine
}

// Silent token refresh - attempts to get a new token without user interaction
export async function silentRefreshToken(
  currentConfig: GoogleDriveConfig
): Promise<GoogleDriveConfig | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  // Check if we're online
  if (!isOnline()) {
    return null
  }

  // Make sure Google API is initialized
  if (!gapiInited || !gisInited) {
    try {
      await initGoogleAPI()
    } catch (error) {
      console.error("Failed to initialize Google API for refresh:", error)
      return null
    }
  }

  if (!window.google?.accounts?.oauth2) {
    console.error("Google Identity Services not available")
    return null
  }

  isRefreshing = true

  refreshPromise = new Promise<GoogleDriveConfig | null>((resolve) => {
    // Set up a timeout for the refresh attempt
    const timeoutId = setTimeout(() => {
      isRefreshing = false
      refreshPromise = null
      resolve(null)
    }, 10000) // 10 second timeout

    // Create token client on-demand with the callback
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (response: any) => {
        clearTimeout(timeoutId)
        isRefreshing = false
        refreshPromise = null

        if (response.error) {
          // User needs to re-authenticate
          console.log("Silent refresh failed:", response.error)
          resolve(null)
          return
        }

        try {
          // Set access token before any authenticated requests
          setAccessToken(response.access_token)

          const config: GoogleDriveConfig = {
            accessToken: response.access_token,
            expiresAt: Date.now() + (response.expires_in || 3600) * 1000,
            email: currentConfig.email,
            fileId: currentConfig.fileId,
          }

          resolve(config)
        } catch (error) {
          console.error("Error processing refreshed token:", error)
          resolve(null)
        }
      },
      error_callback: () => {
        clearTimeout(timeoutId)
        isRefreshing = false
        refreshPromise = null
        resolve(null)
      },
    })

    // Try silent refresh (empty prompt means no popup if possible)
    try {
      tokenClient.requestAccessToken({ prompt: "" })
    } catch (error) {
      clearTimeout(timeoutId)
      isRefreshing = false
      refreshPromise = null
      console.error("Silent refresh request failed:", error)
      resolve(null)
    }
  })

  return refreshPromise
}

// Find or create backup file in Google Drive
async function getOrCreateBackupFile(config: GoogleDriveConfig): Promise<string> {
  await ensureAuthenticated(config)

  // Search for existing backup file
  const response = await gapi.client.drive.files.list({
    q: `name='${BACKUP_FILENAME}' and trashed=false`,
    spaces: "drive",
    fields: "files(id, name)",
  })

  const files = response.result.files || []

  if (files.length > 0) {
    return files[0].id!
  }

  // Create new backup file
  const file = await gapi.client.drive.files.create({
    resource: {
      name: BACKUP_FILENAME,
      mimeType: "application/json",
    },
    fields: "id",
  })

  return file.result.id!
}

// Custom error class for better error handling
export class GoogleDriveError extends Error {
  code: "OFFLINE" | "TOKEN_EXPIRED" | "NETWORK_ERROR" | "API_ERROR" | "NOT_FOUND"

  constructor(
    message: string,
    code: "OFFLINE" | "TOKEN_EXPIRED" | "NETWORK_ERROR" | "API_ERROR" | "NOT_FOUND"
  ) {
    super(message)
    this.name = "GoogleDriveError"
    this.code = code
  }
}

// Upload data to Google Drive
export async function uploadToGoogleDrive(config: GoogleDriveConfig, data: AppData): Promise<string> {
  if (!isOnline()) {
    throw new GoogleDriveError(
      "You're offline. Sync will resume when you're back online.",
      "OFFLINE"
    )
  }

  if (isTokenExpired(config)) {
    throw new GoogleDriveError(
      "Access token expired. Please reconnect Google Drive.",
      "TOKEN_EXPIRED"
    )
  }

  await ensureAuthenticated(config)

  const fileId = config.fileId || (await getOrCreateBackupFile(config))
  const content = JSON.stringify(data, null, 2)

  try {
    // Update file content
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: "PATCH",
      params: {
        uploadType: "media",
      },
      body: content,
    })

    return fileId
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      throw new GoogleDriveError(
        "Access token expired. Please reconnect Google Drive.",
        "TOKEN_EXPIRED"
      )
    }
    if (error.status === 404) {
      throw new GoogleDriveError(
        "Backup file not found. Please try syncing again.",
        "NOT_FOUND"
      )
    }
    throw new GoogleDriveError(
      error.message || "Failed to upload to Google Drive",
      "API_ERROR"
    )
  }
}

// Download data from Google Drive
export async function downloadFromGoogleDrive(config: GoogleDriveConfig): Promise<AppData | null> {
  if (!isOnline()) {
    throw new GoogleDriveError(
      "You're offline. Sync will resume when you're back online.",
      "OFFLINE"
    )
  }

  if (isTokenExpired(config)) {
    throw new GoogleDriveError(
      "Access token expired. Please reconnect Google Drive.",
      "TOKEN_EXPIRED"
    )
  }

  await ensureAuthenticated(config)

  const fileId = config.fileId || (await getOrCreateBackupFile(config))

  try {
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: "media",
    })

    return response.result as AppData
  } catch (error: any) {
    if (error.status === 404) {
      return null // File doesn't exist yet
    }
    if (error.status === 401 || error.status === 403) {
      throw new GoogleDriveError(
        "Access token expired. Please reconnect Google Drive.",
        "TOKEN_EXPIRED"
      )
    }
    throw new GoogleDriveError(
      error.message || "Failed to download from Google Drive",
      "API_ERROR"
    )
  }
}

// Sync data with Google Drive (merge strategy)
export async function syncWithGoogleDrive(
  config: GoogleDriveConfig,
  localData: AppData,
): Promise<{ data: AppData; fileId: string }> {
  if (!isOnline()) {
    throw new GoogleDriveError(
      "You're offline. Sync will resume when you're back online.",
      "OFFLINE"
    )
  }

  if (isTokenExpired(config)) {
    throw new GoogleDriveError(
      "Access token expired. Please reconnect Google Drive.",
      "TOKEN_EXPIRED"
    )
  }

  const remoteData = await downloadFromGoogleDrive(config)

  if (!remoteData) {
    // No remote data, upload local data
    const fileId = await uploadToGoogleDrive(config, localData)
    return { data: localData, fileId }
  }

  // Merge strategy: keep items with latest updatedAt timestamp
  const mergedData: AppData = {
    topics: mergeByLatest(localData.topics, remoteData.topics),
    qaItems: mergeByLatest(localData.qaItems, remoteData.qaItems),
    snippets: mergeByLatest(localData.snippets, remoteData.snippets),
  }

  // Upload merged data
  const fileId = await uploadToGoogleDrive(config, mergedData)

  return { data: mergedData, fileId }
}

// Merge arrays by keeping items with latest updatedAt
function mergeByLatest<T extends { id: string; updatedAt: number }>(local: T[], remote: T[]): T[] {
  const merged = new Map<string, T>()

  // Add all remote items
  remote.forEach((item) => merged.set(item.id, item))

  // Add or update with local items if they're newer
  local.forEach((item) => {
    const existing = merged.get(item.id)
    if (!existing || item.updatedAt > existing.updatedAt) {
      merged.set(item.id, item)
    }
  })

  return Array.from(merged.values())
}

// Disconnect Google Drive
export function disconnectGoogleDrive() {
  if (gapi.client.getToken()) {
    gapi.client.setToken(null)
  }
}

// Get sync status from localStorage
export function getSyncStatus(): SyncStatus {
  if (typeof window === "undefined") return { isSyncing: false }

  const stored = localStorage.getItem("sync-status")
  if (!stored) return { isSyncing: false }

  try {
    return JSON.parse(stored)
  } catch {
    return { isSyncing: false }
  }
}

// Save sync status to localStorage
export function saveSyncStatus(status: SyncStatus) {
  if (typeof window === "undefined") return
  localStorage.setItem("sync-status", JSON.stringify(status))
}
