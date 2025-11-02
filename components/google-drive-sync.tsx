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
import { AlertCircle, CheckCircle2, Cloud, CloudOff, Download, RefreshCw, Upload } from "lucide-react"
import { useEffect, useState } from "react"

export function GoogleDriveSync() {
  const {
    config,
    syncStatus,
    isConnected,
    connect,
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

  useEffect(() => {
    const settings = getSettings()
    setAutoSync(settings.autoSync)
    setSyncIntervalState(settings.syncInterval)
  }, [])

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
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

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return "Never"

    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    return "Just now"
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

            <Button onClick={handleConnect} className="w-full cursor-pointer">
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
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Connected
                </p>
                <p className="text-sm text-muted-foreground">{config?.email}</p>
                <p className="text-xs text-muted-foreground">Last sync: {formatLastSync(syncStatus.lastSyncAt)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowDisconnectDialog(true)}>
                <CloudOff className="h-4 w-4" />
              </Button>
            </div>

            {syncStatus.error && (
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
                disabled={syncStatus.isSyncing}
                className="w-full bg-transparent"
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncStatus.isSyncing ? "animate-spin" : ""}`} />
                {syncStatus.isSyncing ? "Syncing..." : "Sync Now"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={uploadBackup} disabled={syncStatus.isSyncing} variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Backup
                </Button>
                <Button onClick={restoreBackup} disabled={syncStatus.isSyncing} variant="outline" size="sm">
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
