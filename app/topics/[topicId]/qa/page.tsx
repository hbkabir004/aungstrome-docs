"use client"

import { QACard } from "@/components/qa-card"
import { QAEditor } from "@/components/qa-editor"
import { QAViewer } from "@/components/qa-viewer"
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
import { useQAItems, useTopics } from "@/hooks/use-data"
import type { QAItem } from "@/lib/types"
import { ArrowLeft, Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function TopicQAPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.topicId as string

  const { topics } = useTopics()
  const { qaItems, createQAItem, updateQAItem, deleteQAItem } = useQAItems(topicId)

  const [editingItem, setEditingItem] = useState<QAItem | undefined>()
  const [viewingItem, setViewingItem] = useState<QAItem | undefined>()
  const [deletingItem, setDeletingItem] = useState<QAItem | undefined>()
  const [isCreating, setIsCreating] = useState(false)

  const topic = topics.find((t) => t.id === topicId)

  const handleSave = async (item: QAItem) => {
    if (editingItem) {
      await updateQAItem(item)
    } else {
      await createQAItem(item)
    }
    setEditingItem(undefined)
    setIsCreating(false)
  }

  const handleDelete = async () => {
    if (deletingItem) {
      await deleteQAItem(deletingItem.id)
      setDeletingItem(undefined)
      if (viewingItem?.id === deletingItem.id) {
        setViewingItem(undefined)
      }
    }
  }

  if (isCreating || editingItem) {
    return (
      <QAEditor
        item={editingItem}
        topicId={topicId}
        onSave={handleSave}
        onCancel={() => {
          setEditingItem(undefined)
          setIsCreating(false)
        }}
      />
    )
  }

  if (viewingItem) {
    return (
      <QAViewer
        item={viewingItem}
        onClose={() => setViewingItem(undefined)}
        onEdit={() => {
          setEditingItem(viewingItem)
          setViewingItem(undefined)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="page-container">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{topic?.name || "Topic"}</h1>
              <p className="text-muted-foreground mt-1">Q&A Items</p>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Q&A
            </Button>
          </div>
        </div>

        {/* Q&A List */}
        {qaItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No Q&A items yet</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Q&A
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {qaItems.map((item) => (
              <QACard
                key={item.id}
                item={item}
                onClick={() => setViewingItem(item)}
                onEdit={() => setEditingItem(item)}
                onDelete={() => setDeletingItem(item)}
              />
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Q&A Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.title}"? This action cannot be undone.
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
