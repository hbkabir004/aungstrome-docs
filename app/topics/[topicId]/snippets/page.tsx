"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavHeader } from "@/components/nav-header"
import { SnippetCard } from "@/components/snippet-card"
import { SnippetEditor } from "@/components/snippet-editor"
import { SnippetViewer } from "@/components/snippet-viewer"
import { useTopics, useSnippets } from "@/hooks/use-data"
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

export default function TopicSnippetsPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.topicId as string

  const { topics } = useTopics()
  const { snippets, createSnippet, updateSnippet, deleteSnippet } = useSnippets(topicId)

  const [editingSnippet, setEditingSnippet] = useState<Snippet | undefined>()
  const [viewingSnippet, setViewingSnippet] = useState<Snippet | undefined>()
  const [deletingSnippet, setDeletingSnippet] = useState<Snippet | undefined>()
  const [isCreating, setIsCreating] = useState(false)

  const topic = topics.find((t) => t.id === topicId)

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
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{topic?.name || "Topic"}</h1>
              <p className="text-muted-foreground mt-1">Code Snippets</p>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Snippet
            </Button>
          </div>
        </div>

        {/* Snippets List */}
        {snippets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No snippets yet</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Snippet
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet) => (
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
