// Google Drive API integration for backup and sync
import type { AppData, GoogleDriveConfig, SyncStatus } from "./types"
import { google } from "googleapis"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""
const SCOPES = "https://www.googleapis.com/auth/drive.file"
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
const BACKUP_FILENAME = "aungstrome-docs-backup.json"

let gapiInited = false
let gisInited = false
let tokenClient: google.accounts.oauth2.TokenClient | null = null
let gapi: any = null

// Initialize Google API
export async function initGoogleAPI(): Promise<void> {
  if (typeof window === "undefined") return

  return new Promise((resolve, reject) => {
    // Load gapi
    const gapiScript = document.createElement("script")
    gapiScript.src = "https://apis.google.com/js/api.js"
    gapiScript.async = true
    gapiScript.defer = true
    gapiScript.onload = () => {
      gapi = window.gapi
      gapi.load("client", async () => {
        try {
          await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          })
          gapiInited = true
          if (gisInited) resolve()
        } catch (error) {
          reject(error)
        }
      })
    }
    document.head.appendChild(gapiScript)

    // Load gis
    const gisScript = document.createElement("script")
    gisScript.src = "https://accounts.google.com/gsi/client"
    gisScript.async = true
    gisScript.defer = true
    gisScript.onload = () => {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: "", // Will be set during auth
      })
      gisInited = true
      if (gapiInited) resolve()
    }
    document.head.appendChild(gisScript)
  })
}

// Authenticate with Google Drive
export async function authenticateGoogleDrive(): Promise<GoogleDriveConfig> {
  if (!gapiInited || !gisInited || !tokenClient) {
    await initGoogleAPI()
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Token client not initialized"))
      return
    }

    tokenClient.callback = async (response: google.accounts.oauth2.TokenResponse) => {
      if (response.error) {
        reject(new Error(response.error))
        return
      }

      try {
        // Get user info
        const userInfo = await gapi.client.request({
          path: "https://www.googleapis.com/oauth2/v2/userinfo",
        })

        const config: GoogleDriveConfig = {
          accessToken: response.access_token,
          expiresAt: Date.now() + (response.expires_in || 3600) * 1000,
          email: userInfo.result.email,
        }

        resolve(config)
      } catch (error) {
        reject(error)
      }
    }

    tokenClient.requestAccessToken({ prompt: "consent" })
  })
}

// Set access token for API calls
function setAccessToken(token: string) {
  gapi.client.setToken({ access_token: token })
}

// Check if token is expired
export function isTokenExpired(config: GoogleDriveConfig): boolean {
  return Date.now() >= config.expiresAt
}

// Find or create backup file in Google Drive
async function getOrCreateBackupFile(config: GoogleDriveConfig): Promise<string> {
  setAccessToken(config.accessToken)

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

// Upload data to Google Drive
export async function uploadToGoogleDrive(config: GoogleDriveConfig, data: AppData): Promise<string> {
  if (isTokenExpired(config)) {
    throw new Error("Access token expired. Please reconnect Google Drive.")
  }

  setAccessToken(config.accessToken)

  const fileId = config.fileId || (await getOrCreateBackupFile(config))
  const content = JSON.stringify(data, null, 2)

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
}

// Download data from Google Drive
export async function downloadFromGoogleDrive(config: GoogleDriveConfig): Promise<AppData | null> {
  if (isTokenExpired(config)) {
    throw new Error("Access token expired. Please reconnect Google Drive.")
  }

  setAccessToken(config.accessToken)

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
    throw error
  }
}

// Sync data with Google Drive (merge strategy)
export async function syncWithGoogleDrive(
  config: GoogleDriveConfig,
  localData: AppData,
): Promise<{ data: AppData; fileId: string }> {
  if (isTokenExpired(config)) {
    throw new Error("Access token expired. Please reconnect Google Drive.")
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
