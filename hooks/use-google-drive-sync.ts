"use client"

// Hook for Google Drive sync functionality
import { useToast } from "@/hooks/use-toast"
import {
  authenticateGoogleDrive,
  disconnectGoogleDrive,
  downloadFromGoogleDrive,
  getSyncStatus,
  GoogleDriveError,
  initGoogleAPI,
  isOnline,
  isTokenExpired,
  restoreAccessToken,
  saveSyncStatus,
  silentRefreshToken,
  syncWithGoogleDrive,
  uploadToGoogleDrive,
} from "@/lib/google-drive"
import { exportData, importData } from "@/lib/storage"
import { getGoogleDriveConfig, getSettings, saveGoogleDriveConfig, saveSettings } from "@/lib/storage/settings"
import type { GoogleDriveConfig, SyncStatus } from "@/lib/types"
import { useCallback, useEffect, useRef, useState } from "react"

// Key for storing pending sync flag
const PENDING_SYNC_KEY = "pending-sync"

export function useGoogleDriveSync() {
  const { toast } = useToast()
  const [config, setConfig] = useState<GoogleDriveConfig | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isSyncing: false })
  const [isInitialized, setIsInitialized] = useState(false)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState(30)
  const [isOffline, setIsOffline] = useState(false)
  const [needsReconnect, setNeedsReconnect] = useState(false)

  // Ref to store the latest sync function to avoid stale closures in intervals
  const syncFnRef = useRef<(() => Promise<void>) | null>(null)
  const configRef = useRef<GoogleDriveConfig | null>(null)

  // Keep config ref updated
  useEffect(() => {
    configRef.current = config
  }, [config])

  // Load config and sync status on mount
  useEffect(() => {
    const loadedConfig = getGoogleDriveConfig()
    const loadedStatus = getSyncStatus()
    const settings = getSettings()

    setConfig(loadedConfig)
    setSyncStatus(loadedStatus)
    setAutoSyncEnabled(settings.autoSync)
    setSyncIntervalMinutes(settings.syncInterval)
    setIsOffline(!isOnline())

    // Check if token is expired and needs reconnect
    if (loadedConfig && isTokenExpired(loadedConfig)) {
      setNeedsReconnect(true)
    }

    // Initialize Google API and restore access token
    if (loadedConfig) {
      restoreAccessToken(loadedConfig)
        .then((restored) => {
          setIsInitialized(true)
          if (!restored && !isTokenExpired(loadedConfig)) {
            // Token restore failed but not expired - try initializing anyway
            return initGoogleAPI()
          }
        })
        .catch((error) => {
          console.error("Failed to restore Google Drive session:", error)
          setIsInitialized(true)
        })
    }
  }, [])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      // Check if there's a pending sync
      const hasPendingSync = localStorage.getItem(PENDING_SYNC_KEY) === "true"
      if (hasPendingSync && configRef.current && !isTokenExpired(configRef.current)) {
        localStorage.removeItem(PENDING_SYNC_KEY)
        toast({
          title: "Back online",
          description: "Syncing your data...",
        })
        // Trigger sync after a short delay
        setTimeout(() => {
          if (syncFnRef.current) {
            syncFnRef.current()
          }
        }, 1000)
      } else if (hasPendingSync) {
        toast({
          title: "Back online",
          description: "Your data was preserved. Manual sync available.",
        })
        localStorage.removeItem(PENDING_SYNC_KEY)
      }
    }

    const handleOffline = () => {
      setIsOffline(true)
      toast({
        title: "You're offline",
        description: "Your changes will be saved locally and synced when you're back online.",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  // Auto-sync interval
  useEffect(() => {
    if (!config || !autoSyncEnabled) return

    const intervalMs = syncIntervalMinutes * 60 * 1000
    const interval = setInterval(() => {
      // Only sync if online and not already syncing
      if (isOnline() && syncFnRef.current) {
        syncFnRef.current()
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [config, autoSyncEnabled, syncIntervalMinutes])

  // Helper function to try refreshing token
  const tryRefreshToken = useCallback(
    async (currentConfig: GoogleDriveConfig): Promise<GoogleDriveConfig | null> => {
      const refreshedConfig = await silentRefreshToken(currentConfig)
      if (refreshedConfig) {
        saveGoogleDriveConfig(refreshedConfig)
        setConfig(refreshedConfig)
        setNeedsReconnect(false)
        return refreshedConfig
      }
      return null
    },
    []
  )

  // Helper to handle sync errors
  const handleSyncError = useCallback(
    (error: unknown, operation: string) => {
      const isGoogleDriveError = error instanceof GoogleDriveError
      const errorCode = isGoogleDriveError ? (error as GoogleDriveError).code : null

      if (errorCode === "OFFLINE") {
        // Mark that we have pending changes
        localStorage.setItem(PENDING_SYNC_KEY, "true")
        const status: SyncStatus = {
          isSyncing: false,
          error: "Offline - will sync when back online",
        }
        setSyncStatus(status)
        saveSyncStatus(status)
        return
      }

      if (errorCode === "TOKEN_EXPIRED") {
        setNeedsReconnect(true)
        const status: SyncStatus = {
          isSyncing: false,
          error: "Session expired. Please reconnect.",
        }
        setSyncStatus(status)
        saveSyncStatus(status)
        toast({
          title: "Session expired",
          description: "Please reconnect Google Drive to continue syncing.",
          variant: "destructive",
        })
        return
      }

      // Generic error
      const errorMessage = error instanceof Error ? error.message : `${operation} failed`
      const status: SyncStatus = {
        isSyncing: false,
        error: errorMessage,
      }
      setSyncStatus(status)
      saveSyncStatus(status)

      toast({
        title: `${operation} failed`,
        description: errorMessage,
        variant: "destructive",
      })
    },
    [toast]
  )

  const connect = useCallback(async () => {
    try {
      await initGoogleAPI()
      const newConfig = await authenticateGoogleDrive()

      // Perform initial sync
      const localData = await exportData()
      const { data, fileId } = await syncWithGoogleDrive(newConfig, localData)

      // Update config with fileId
      const updatedConfig = { ...newConfig, fileId }
      saveGoogleDriveConfig(updatedConfig)
      setConfig(updatedConfig)
      setNeedsReconnect(false)

      // Import merged data
      await importData(data)

      toast({
        title: "Google Drive connected",
        description: `Connected as ${newConfig.email}. Initial sync completed.`,
      })

      return updatedConfig
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Google Drive",
        variant: "destructive",
      })
      throw error
    }
  }, [toast])

  const reconnect = useCallback(async () => {
    // Use the connect function but don't throw on error
    try {
      await connect()
    } catch {
      // Error already handled in connect
    }
  }, [connect])

  const disconnect = useCallback(() => {
    disconnectGoogleDrive()
    saveGoogleDriveConfig(null)
    setConfig(null)
    setSyncStatus({ isSyncing: false })
    setNeedsReconnect(false)

    toast({
      title: "Google Drive disconnected",
      description: "Your data remains stored locally",
    })
  }, [toast])

  const performSync = useCallback(async () => {
    if (!config) {
      return
    }

    // Check if offline first
    if (!isOnline()) {
      localStorage.setItem(PENDING_SYNC_KEY, "true")
      const status: SyncStatus = {
        isSyncing: false,
        error: "Offline - will sync when back online",
      }
      setSyncStatus(status)
      saveSyncStatus(status)
      return
    }

    let activeConfig = config

    // Try to refresh token if expired
    if (isTokenExpired(config)) {
      const refreshedConfig = await tryRefreshToken(config)
      if (refreshedConfig) {
        activeConfig = refreshedConfig
      } else {
        // Can't refresh, user needs to reconnect
        setNeedsReconnect(true)
        const status: SyncStatus = {
          isSyncing: false,
          error: "Session expired. Please reconnect.",
        }
        setSyncStatus(status)
        saveSyncStatus(status)
        return
      }
    }

    try {
      setSyncStatus({ isSyncing: true })
      saveSyncStatus({ isSyncing: true })

      const localData = await exportData()
      const { data, fileId } = await syncWithGoogleDrive(activeConfig, localData)

      // Update config with fileId if it changed
      if (fileId !== activeConfig.fileId) {
        const updatedConfig = { ...activeConfig, fileId }
        saveGoogleDriveConfig(updatedConfig)
        setConfig(updatedConfig)
      }

      // Import merged data
      await importData(data)

      // Clear any pending sync flag
      localStorage.removeItem(PENDING_SYNC_KEY)

      const status: SyncStatus = {
        isSyncing: false,
        lastSyncAt: Date.now(),
      }
      setSyncStatus(status)
      saveSyncStatus(status)

      toast({
        title: "Sync completed",
        description: "Your data has been synced with Google Drive",
      })
    } catch (error) {
      handleSyncError(error, "Sync")
    }
  }, [config, toast, tryRefreshToken, handleSyncError])

  // Keep the ref updated with the latest performSync function
  useEffect(() => {
    syncFnRef.current = performSync
  }, [performSync])

  const uploadBackup = useCallback(async () => {
    if (!config) {
      return
    }

    // Check if offline first
    if (!isOnline()) {
      toast({
        title: "You're offline",
        description: "Please try again when you're back online.",
        variant: "destructive",
      })
      return
    }

    let activeConfig = config

    // Try to refresh token if expired
    if (isTokenExpired(config)) {
      const refreshedConfig = await tryRefreshToken(config)
      if (refreshedConfig) {
        activeConfig = refreshedConfig
      } else {
        setNeedsReconnect(true)
        toast({
          title: "Session expired",
          description: "Please reconnect Google Drive.",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setSyncStatus({ isSyncing: true })

      const localData = await exportData()
      const fileId = await uploadToGoogleDrive(activeConfig, localData)

      // Update config with fileId if it changed
      if (fileId !== activeConfig.fileId) {
        const updatedConfig = { ...activeConfig, fileId }
        saveGoogleDriveConfig(updatedConfig)
        setConfig(updatedConfig)
      }

      const status: SyncStatus = {
        isSyncing: false,
        lastSyncAt: Date.now(),
      }
      setSyncStatus(status)
      saveSyncStatus(status)

      toast({
        title: "Backup uploaded",
        description: "Your data has been backed up to Google Drive",
      })
    } catch (error) {
      handleSyncError(error, "Upload")
    }
  }, [config, toast, tryRefreshToken, handleSyncError])

  const restoreBackup = useCallback(async () => {
    if (!config) {
      return
    }

    // Check if offline first
    if (!isOnline()) {
      toast({
        title: "You're offline",
        description: "Please try again when you're back online.",
        variant: "destructive",
      })
      return
    }

    let activeConfig = config

    // Try to refresh token if expired
    if (isTokenExpired(config)) {
      const refreshedConfig = await tryRefreshToken(config)
      if (refreshedConfig) {
        activeConfig = refreshedConfig
      } else {
        setNeedsReconnect(true)
        toast({
          title: "Session expired",
          description: "Please reconnect Google Drive.",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setSyncStatus({ isSyncing: true })

      const remoteData = await downloadFromGoogleDrive(activeConfig)

      if (!remoteData) {
        toast({
          title: "No backup found",
          description: "No backup file found in Google Drive",
          variant: "destructive",
        })
        setSyncStatus({ isSyncing: false })
        return
      }

      await importData(remoteData)

      const status: SyncStatus = {
        isSyncing: false,
        lastSyncAt: Date.now(),
      }
      setSyncStatus(status)
      saveSyncStatus(status)

      toast({
        title: "Backup restored",
        description: "Your data has been restored from Google Drive",
      })
    } catch (error) {
      handleSyncError(error, "Restore")
    }
  }, [config, toast, tryRefreshToken, handleSyncError])

  const toggleAutoSync = useCallback(
    (enabled: boolean) => {
      setAutoSyncEnabled(enabled)
      saveSettings({ autoSync: enabled })

      toast({
        title: enabled ? "Auto-sync enabled" : "Auto-sync disabled",
        description: enabled ? "Your data will sync automatically" : "Manual sync only",
      })
    },
    [toast],
  )

  const updateSyncInterval = useCallback((minutes: number) => {
    setSyncIntervalMinutes(minutes)
    saveSettings({ syncInterval: minutes })
  }, [])

  return {
    config,
    syncStatus,
    isInitialized,
    isConnected: !!config,
    isOffline,
    needsReconnect,
    connect,
    reconnect,
    disconnect,
    sync: performSync,
    uploadBackup,
    restoreBackup,
    toggleAutoSync,
    setSyncInterval: updateSyncInterval,
  }
}
