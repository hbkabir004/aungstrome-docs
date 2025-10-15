"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, BookOpen, FileText, Code2, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavHeader } from "@/components/nav-header"
import { TopicCard } from "@/components/topic-card"
import { TopicDialog } from "@/components/topic-dialog"
import { useTopics, useQAItems, useSnippets } from "@/hooks/use-data"
import { initializeDataIfNeeded } from "@/lib/init-data"
import type { Topic } from "@/lib/types"
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

export default function HomePage() {
  const [initialized, setInitialized] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>()
  const [deletingTopic, setDeletingTopic] = useState<Topic | undefined>()

  const { topics, createTopic, updateTopic, deleteTopic } = useTopics()
  const { qaItems } = useQAItems()
  const { snippets } = useSnippets()

  useEffect(() => {
    initializeDataIfNeeded().then(() => setInitialized(true))
  }, [])

  const handleSaveTopic = async (topic: Topic) => {
    if (editingTopic) {
      await updateTopic(topic)
    } else {
      await createTopic(topic)
    }
    setEditingTopic(undefined)
  }

  const handleDeleteTopic = async () => {
    if (deletingTopic) {
      await deleteTopic(deletingTopic.id)
      setDeletingTopic(undefined)
    }
  }

  const getTopicCounts = (topicId: string) => {
    const qaCount = qaItems.filter((item) => item.topicId === topicId).length
    const snippetCount = snippets.filter((snippet) => snippet.topicId === topicId).length
    return { qaCount, snippetCount }
  }

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const totalQA = qaItems.length
  const totalSnippets = snippets.length

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container max-w-screen-2xl py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Interview Preparation Docs</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Your personal knowledge base for technical interviews. Store Q&A, code snippets, and notes with interactive
            previews.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topics</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topics.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Q&A Items</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQA}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Code Snippets</CardTitle>
              <Code2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSnippets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/search">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Search All
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Topics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Topics</h2>
              <p className="text-sm text-muted-foreground mt-1">Organize your interview preparation by topic</p>
            </div>
            <Button
              onClick={() => {
                setEditingTopic(undefined)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Topic
            </Button>
          </div>

          {topics.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first topic to get started</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Topic
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => {
                const { qaCount, snippetCount } = getTopicCounts(topic.id)
                return (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    qaCount={qaCount}
                    snippetCount={snippetCount}
                    onEdit={() => {
                      setEditingTopic(topic)
                      setDialogOpen(true)
                    }}
                    onDelete={() => setDeletingTopic(topic)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </main>

      <TopicDialog open={dialogOpen} onOpenChange={setDialogOpen} topic={editingTopic} onSave={handleSaveTopic} />

      <AlertDialog open={!!deletingTopic} onOpenChange={(open) => !open && setDeletingTopic(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTopic?.name}"? This will not delete the Q&A items and snippets
              associated with this topic.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTopic}
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
