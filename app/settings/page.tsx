"use client"

import type React from "react"

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
import { useQAItems, useSnippets, useTopics } from "@/hooks/use-data"
import { useToast } from "@/hooks/use-toast"
import { clearAllData, exportData, getStorageBackend, importData, setStorageBackend } from "@/lib/storage"
import type { StorageBackend } from "@/lib/types"
import { AlertCircle, CheckCircle2, Cloud, Database, Download, Github, Trash2, Upload } from "lucide-react"
import { useState } from "react"
import { GoogleDriveSync } from "@/components/google-drive-sync"

export default function SettingsPage() {
  const { toast } = useToast()
  const { topics, refresh: refreshTopics } = useTopics()
  const { qaItems, refresh: refreshQA } = useQAItems()
  const { snippets, refresh: refreshSnippets } = useSnippets()

  const [storageBackend, setStorageBackendState] = useState<StorageBackend>(getStorageBackend())
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const data = await exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `aungstrome-docs-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Your data has been exported to a JSON file",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      const text = await file.text()
      const data = JSON.parse(text)

      // Validate data structure
      if (!data.topics || !data.qaItems || !data.snippets) {
        throw new Error("Invalid data format")
      }

      await importData(data)
      await Promise.all([refreshTopics(), refreshQA(), refreshSnippets()])

      toast({
        title: "Import successful",
        description: `Imported ${data.topics.length} topics, ${data.qaItems.length} Q&A items, and ${data.snippets.length} snippets`,
      })
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      event.target.value = ""
    }
  }

  const handleClearData = async () => {
    try {
      await clearAllData()
      await Promise.all([refreshTopics(), refreshQA(), refreshSnippets()])
      setShowClearDialog(false)

      toast({
        title: "Data cleared",
        description: "All data has been removed from storage",
      })
    } catch (error) {
      toast({
        title: "Clear failed",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStorageBackendChange = (backend: StorageBackend) => {
    setStorageBackend(backend)
    setStorageBackendState(backend)

    toast({
      title: "Storage backend changed",
      description: `Now using ${backend === "indexeddb" ? "IndexedDB" : "LocalStorage"}. Please refresh the page.`,
    })

    // Refresh after a short delay to allow the toast to show
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  const totalItems = topics.length + qaItems.length + snippets.length

  return (
    <div className="min-h-screen bg-background">
      <main className="page-container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your app settings and data</p>
        </div>

        <div className="space-y-6">
          {/* Storage Backend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Storage Backend
              </CardTitle>
              <CardDescription>Choose where your data is stored locally</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storage-backend">Backend Type</Label>
                <Select value={storageBackend} onValueChange={handleStorageBackendChange}>
                  <SelectTrigger id="storage-backend">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indexeddb">IndexedDB (Recommended)</SelectItem>
                    <SelectItem value="localstorage">LocalStorage (Fallback)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>About Storage Backends</AlertTitle>
                <AlertDescription>
                  <strong>IndexedDB</strong> is recommended for better performance and larger storage capacity.{" "}
                  <strong>LocalStorage</strong> is a simpler fallback option with size limitations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export, import, or clear your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Current Data</p>
                  <p className="text-sm text-muted-foreground">
                    {topics.length} topics, {qaItems.length} Q&A items, {snippets.length} snippets
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>

              <div className="space-y-3">
                <div>
                  <Button onClick={handleExport} disabled={isExporting || totalItems === 0} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export Data (JSON)"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Download all your data as a JSON backup file</p>
                </div>

                <div>
                  <Button variant="outline" disabled={isImporting} className="w-full relative bg-transparent" asChild>
                    <label>
                      <Upload className="mr-2 h-4 w-4" />
                      {isImporting ? "Importing..." : "Import Data (JSON)"}
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isImporting}
                      />
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Import data from a JSON backup file (merges with existing data)
                  </p>
                </div>

                <div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowClearDialog(true)}
                    disabled={totalItems === 0}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All Data
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Permanently delete all topics, Q&A items, and snippets
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future Sync Options */}
          <Card>
            <CardHeader>
              <CardTitle>Sync & Backup (Coming Soon)</CardTitle>
              <CardDescription>Connect external services for automatic backup and sync</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" disabled className="w-full justify-start bg-transparent">
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub Gist
              </Button>
              <Button variant="outline" disabled className="w-full justify-start bg-transparent">
                <Cloud className="mr-2 h-4 w-4" />
                Connect Google Drive
              </Button>
              <p className="text-xs text-muted-foreground">
                These features will allow you to automatically sync your data to cloud services
              </p>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage Backend</span>
                <span className="font-medium capitalize">{storageBackend}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PWA Support</span>
                <span className="font-medium">Enabled</span>
              </div>
            </CardContent>
          </Card>

          {/* Google Drive Sync */}
          <GoogleDriveSync />
        </div>
      </main>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {topics.length} topics, {qaItems.length} Q&A items, and {snippets.length}{" "}
              snippets. This action cannot be undone. Consider exporting your data first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
