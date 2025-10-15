"use client"

// Hook for Google Drive sync functionality
import { useToast } from "@/hooks/use-toast"
import {
  authenticateGoogleDrive,
  disconnectGoogleDrive,
  downloadFromGoogleDrive,
  getSyncStatus,
  initGoogleAPI,
  isTokenExpired,
  saveSyncStatus,
  syncWithGoogleDrive,
  uploadToGoogleDrive,
} from "@/lib/google-drive"
import { exportData, importData } from "@/lib/storage"
import { getGoogleDriveConfig, getSettings, saveGoogleDriveConfig, saveSettings } from "@/lib/storage/settings"
import type { GoogleDriveConfig, SyncStatus } from "@/lib/types"
import { useCallback, useEffect, useState } from "react"

export function useGoogleDriveSync() {
  const { toast } = useToast()
  const [config, setConfig] = useState<GoogleDriveConfig | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isSyncing: false })
  const [isInitialized, setIsInitialized] = useState(false)

  // Load config and sync status on mount
  useEffect(() => {
    const loadedConfig = getGoogleDriveConfig()
    const loadedStatus = getSyncStatus()

    setConfig(loadedConfig)
    setSyncStatus(loadedStatus)

    // Initialize Google API
    if (loadedConfig) {
      initGoogleAPI().then(() => setIsInitialized(true))
    }
  }, [])

  // Auto-sync interval
  useEffect(() => {
    const settings = getSettings()
    if (!config || !settings.autoSync || isTokenExpired(config)) return

    const intervalMs = settings.syncInterval * 60 * 1000
    const interval = setInterval(() => {
      performSync()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [config])

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

  const disconnect = useCallback(() => {
    disconnectGoogleDrive()
    saveGoogleDriveConfig(null)
    setConfig(null)
    setSyncStatus({ isSyncing: false })

    toast({
      title: "Google Drive disconnected",
      description: "Your data remains stored locally",
    })
  }, [toast])

  const performSync = useCallback(async () => {
    if (!config || isTokenExpired(config)) {
      const status: SyncStatus = {
        isSyncing: false,
        error: "Access token expired. Please reconnect.",
      }
      setSyncStatus(status)
      saveSyncStatus(status)
      return
    }

    try {
      setSyncStatus({ isSyncing: true })
      saveSyncStatus({ isSyncing: true })

      const localData = await exportData()
      const { data, fileId } = await syncWithGoogleDrive(config, localData)

      // Update config with fileId if it changed
      if (fileId !== config.fileId) {
        const updatedConfig = { ...config, fileId }
        saveGoogleDriveConfig(updatedConfig)
        setConfig(updatedConfig)
      }

      // Import merged data
      await importData(data)

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
    } catch (error: any) {
      const status: SyncStatus = {
        isSyncing: false,
        error: error.message || "Sync failed",
      }
      setSyncStatus(status)
      saveSyncStatus(status)

      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync with Google Drive",
        variant: "destructive",
      })
    }
  }, [config, toast])

  const uploadBackup = useCallback(async () => {
    if (!config || isTokenExpired(config)) {
      toast({
        title: "Upload failed",
        description: "Access token expired. Please reconnect.",
        variant: "destructive",
      })
      return
    }

    try {
      setSyncStatus({ isSyncing: true })

      const localData = await exportData()
      const fileId = await uploadToGoogleDrive(config, localData)

      // Update config with fileId if it changed
      if (fileId !== config.fileId) {
        const updatedConfig = { ...config, fileId }
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
    } catch (error: any) {
      setSyncStatus({ isSyncing: false, error: error.message })

      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload backup",
        variant: "destructive",
      })
    }
  }, [config, toast])

  const restoreBackup = useCallback(async () => {
    if (!config || isTokenExpired(config)) {
      toast({
        title: "Restore failed",
        description: "Access token expired. Please reconnect.",
        variant: "destructive",
      })
      return
    }

    try {
      setSyncStatus({ isSyncing: true })

      const remoteData = await downloadFromGoogleDrive(config)

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
    } catch (error: any) {
      setSyncStatus({ isSyncing: false, error: error.message })

      toast({
        title: "Restore failed",
        description: error.message || "Failed to restore backup",
        variant: "destructive",
      })
    }
  }, [config, toast])

  const toggleAutoSync = useCallback(
    (enabled: boolean) => {
      saveSettings({ autoSync: enabled })

      toast({
        title: enabled ? "Auto-sync enabled" : "Auto-sync disabled",
        description: enabled ? "Your data will sync automatically" : "Manual sync only",
      })
    },
    [toast],
  )

  const setSyncInterval = useCallback((minutes: number) => {
    saveSettings({ syncInterval: minutes })
  }, [])

  return {
    config,
    syncStatus,
    isInitialized,
    isConnected: !!config && !isTokenExpired(config),
    connect,
    disconnect,
    sync: performSync,
    uploadBackup,
    restoreBackup,
    toggleAutoSync,
    setSyncInterval,
  }
}
