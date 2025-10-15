"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavHeader } from "@/components/nav-header"
import { SnippetCard } from "@/components/snippet-card"
import { SnippetEditor } from "@/components/snippet-editor"
import { SnippetViewer } from "@/components/snippet-viewer"
import { useSnippets, useTopics } from "@/hooks/use-data"
import type { Snippet } from "@/lib/types"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SnippetsPage() {
  const { topics } = useTopics()
  const { snippets, createSnippet, updateSnippet, deleteSnippet } = useSnippets()

  const [editingSnippet, setEditingSnippet] = useState<Snippet | undefined>()
  const [viewingSnippet, setViewingSnippet] = useState<Snippet | undefined>()
  const [deletingSnippet, setDeletingSnippet] = useState<Snippet | undefined>()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string>("all")

  const filteredSnippets = selectedTopic === "all" ? snippets : snippets.filter((s) => s.topicId === selectedTopic)

  const handleSave = async (snippet: Snippet) => {
    if (editingSnippet) {
      await updateSnippet(snippet)
    } else {
      await createSnippet(snippet)
    }
    setEditingSnippet(undefined)
    setIsCreating(false)
  }

  const handleDelete = async () => {
    if (deletingSnippet) {
      await deleteSnippet(deletingSnippet.id)
      setDeletingSnippet(undefined)
      if (viewingSnippet?.id === deletingSnippet.id) {
        setViewingSnippet(undefined)
      }
    }
  }

  if (isCreating || editingSnippet) {
    const topicId = editingSnippet?.topicId || topics[0]?.id || "default"
    return (
      <SnippetEditor
        snippet={editingSnippet}
        topicId={topicId}
        onSave={handleSave}
        onCancel={() => {
          setEditingSnippet(undefined)
          setIsCreating(false)
        }}
      />
    )
  }

  if (viewingSnippet) {
    return (
      <SnippetViewer
        snippet={viewingSnippet}
        onClose={() => setViewingSnippet(undefined)}
        onEdit={() => {
          setEditingSnippet(viewingSnippet)
          setViewingSnippet(undefined)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container max-w-screen-2xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Snippets</h1>
              <p className="text-muted-foreground mt-1">Browse all your code snippets</p>
            </div>
            <Button onClick={() => setIsCreating(true)} disabled={topics.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              New Snippet
            </Button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Filter by topic:</span>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Snippets List */}
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {snippets.length === 0 ? "No snippets yet" : "No snippets in this topic"}
            </p>
            {topics.length > 0 && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Snippet
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onClick={() => setViewingSnippet(snippet)}
                onEdit={() => setEditingSnippet(snippet)}
                onDelete={() => setDeletingSnippet(snippet)}
              />
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deletingSnippet} onOpenChange={(open) => !open && setDeletingSnippet(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSnippet?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
