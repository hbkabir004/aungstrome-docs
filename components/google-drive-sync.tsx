"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useGoogleDriveSync } from "@/hooks/use-google-drive-sync"
import { getSettings } from "@/lib/storage/settings"
import { AlertCircle, CheckCircle2, Cloud, CloudOff, Download, RefreshCw, Upload, WifiOff, LogIn } from "lucide-react"
import { useEffect, useState } from "react"

export function GoogleDriveSync() {
  const {
    config,
    syncStatus,
    isConnected,
    isOffline,
    needsReconnect,
    connect,
    reconnect,
    disconnect,
    sync,
    uploadBackup,
    restoreBackup,
    toggleAutoSync,
    setSyncInterval,
  } = useGoogleDriveSync()

  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [autoSync, setAutoSync] = useState(false)
  const [syncInterval, setSyncIntervalState] = useState(30)
  const [lastSyncText, setLastSyncText] = useState("Never")

  useEffect(() => {
    const settings = getSettings()
    setAutoSync(settings.autoSync)
    setSyncIntervalState(settings.syncInterval)
  }, [])

  // Update last sync text periodically
  useEffect(() => {
    const updateLastSyncText = () => {
      const timestamp = syncStatus.lastSyncAt
      if (!timestamp) {
        setLastSyncText("Never")
        return
      }

      const now = Date.now()
      const diff = now - timestamp
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) {
        setLastSyncText(`${days} day${days > 1 ? "s" : ""} ago`)
      } else if (hours > 0) {
        setLastSyncText(`${hours} hour${hours > 1 ? "s" : ""} ago`)
      } else if (minutes > 0) {
        setLastSyncText(`${minutes} minute${minutes > 1 ? "s" : ""} ago`)
      } else {
        setLastSyncText("Just now")
      }
    }

    updateLastSyncText()
    const interval = setInterval(updateLastSyncText, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [syncStatus.lastSyncAt])

  const handleConnect = async () => {
    try {
      await connect()
    } catch {
      // Error already handled in hook
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDisconnectDialog(false)
  }

  const handleAutoSyncToggle = (checked: boolean) => {
    setAutoSync(checked)
    toggleAutoSync(checked)
  }

  const handleSyncIntervalChange = (value: string) => {
    const minutes = Number.parseInt(value)
    setSyncIntervalState(minutes)
    setSyncInterval(minutes)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Google Drive Sync
        </CardTitle>
        <CardDescription>Automatically backup and sync your data to Google Drive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Offline Banner */}
        {isOffline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertTitle>You're offline</AlertTitle>
            <AlertDescription>
              Your changes are saved locally. Sync will resume automatically when you're back online.
            </AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Secure & Private</AlertTitle>
              <AlertDescription>
                Your data is encrypted and stored in your personal Google Drive. We only access the backup file we
                create and never share your data with third parties.
              </AlertDescription>
            </Alert>

            <Button onClick={handleConnect} disabled={isOffline} className="w-full cursor-pointer">
              <Cloud className="mr-2 h-4 w-4" />
              Connect Google Drive
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>What happens when you connect:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You'll be asked to sign in to your Google account</li>
                <li>We'll create a backup file in your Google Drive</li>
                <li>Your local data will be synced with the cloud</li>
                <li>You can enable automatic sync for continuous backup</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <p className="font-medium flex items-center gap-2">
                  {needsReconnect ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      Session Expired
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Connected
                    </>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{config?.email}</p>
                <p className="text-xs text-muted-foreground">Last sync: {lastSyncText}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowDisconnectDialog(true)}>
                <CloudOff className="h-4 w-4" />
              </Button>
            </div>

            {/* Session expired - show reconnect */}
            {needsReconnect && (
              <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertTitle>Session expired</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <span>Your Google Drive session has expired. Please reconnect to continue syncing.</span>
                  <Button onClick={reconnect} disabled={isOffline} size="sm" className="w-fit">
                    <LogIn className="mr-2 h-4 w-4" />
                    Reconnect
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {syncStatus.error && !needsReconnect && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sync Error</AlertTitle>
                <AlertDescription>{syncStatus.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync">Automatic Sync</Label>
                  <p className="text-xs text-muted-foreground">Sync data automatically at regular intervals</p>
                </div>
                <Switch id="auto-sync" checked={autoSync} onCheckedChange={handleAutoSyncToggle} />
              </div>

              {autoSync && (
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Sync Interval</Label>
                  <Select value={syncInterval.toString()} onValueChange={handleSyncIntervalChange}>
                    <SelectTrigger id="sync-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="180">Every 3 hours</SelectItem>
                      <SelectItem value="360">Every 6 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={sync}
                disabled={syncStatus.isSyncing || isOffline || needsReconnect}
                className="w-full bg-transparent"
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncStatus.isSyncing ? "animate-spin" : ""}`} />
                {syncStatus.isSyncing ? "Syncing..." : isOffline ? "Offline" : "Sync Now"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={uploadBackup}
                  disabled={syncStatus.isSyncing || isOffline || needsReconnect}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Backup
                </Button>
                <Button
                  onClick={restoreBackup}
                  disabled={syncStatus.isSyncing || isOffline || needsReconnect}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Restore Backup
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>How Sync Works</AlertTitle>
              <AlertDescription className="text-xs space-y-1">
                <p>
                  <strong>Sync:</strong> Merges local and cloud data, keeping the latest version of each item
                </p>
                <p>
                  <strong>Upload:</strong> Overwrites cloud backup with your current local data
                </p>
                <p>
                  <strong>Restore:</strong> Replaces local data with cloud backup
                </p>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Google Drive</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect your Google Drive account. Your data will remain stored locally and in Google Drive,
              but automatic syncing will stop. You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>Disconnect</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
