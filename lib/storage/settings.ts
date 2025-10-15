// Settings storage using localStorage
import type { AppSettings, GoogleDriveConfig } from "../types"

const SETTINGS_KEY = "app-settings"

const defaultSettings: AppSettings = {
  storageBackend: "indexeddb",
  theme: "system",
  autoSync: false,
  syncInterval: 30, // 30 minutes
}

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings

  const stored = localStorage.getItem(SETTINGS_KEY)
  if (!stored) return defaultSettings

  try {
    return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: Partial<AppSettings>) {
  if (typeof window === "undefined") return

  const current = getSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
}

export function getGoogleDriveConfig(): GoogleDriveConfig | null {
  const settings = getSettings()
  return settings.googleDrive || null
}

export function saveGoogleDriveConfig(config: GoogleDriveConfig | null) {
  saveSettings({ googleDrive: config || undefined })
}
