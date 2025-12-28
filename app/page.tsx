"use client";

import { TopicCard } from "@/components/topic-card";
import { TopicDialog } from "@/components/topic-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQAItems, useSnippets, useTopics } from "@/hooks/use-data";
import { initializeDataIfNeeded } from "@/lib/init-data";
import type { Topic } from "@/lib/types";
import { BookOpen, Code2, FileText, Plus, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function HomePage() {
  const [initialized, setInitialized] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();
  const [deletingTopic, setDeletingTopic] = useState<Topic | undefined>();

  const { topics, createTopic, updateTopic, deleteTopic } = useTopics();
  const { qaItems } = useQAItems();
  const { snippets } = useSnippets();

  useEffect(() => {
    initializeDataIfNeeded().then(() => setInitialized(true));
  }, []);

  const handleSaveTopic = useCallback(async (topic: Topic) => {
    if (editingTopic) {
      await updateTopic(topic);
    } else {
      await createTopic(topic);
    }
    setEditingTopic(undefined);
  }, [editingTopic, updateTopic, createTopic]);

  const handleDeleteTopic = useCallback(async () => {
    if (deletingTopic) {
      await deleteTopic(deletingTopic.id);
      setDeletingTopic(undefined);
    }
  }, [deletingTopic, deleteTopic]);

  // Memoize topic counts to avoid recalculating on every render
  const topicCounts = useMemo(() => {
    const counts: Record<string, { qaCount: number; snippetCount: number }> = {};
    topics.forEach((topic) => {
      counts[topic.id] = {
        qaCount: qaItems.filter((item) => item.topicId === topic.id).length,
        snippetCount: snippets.filter((s) => s.topicId === topic.id).length,
      };
    });
    return counts;
  }, [topics, qaItems, snippets]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const totalQA = qaItems.length;
  const totalSnippets = snippets.length;

  return (
    <div className="min-h-screen bg-background">
      <main className="page-container">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Interview Preparation Docs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            My personal knowledge base for technical interviews. Store Q&A,
            code snippets, and notes with interactive previews.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
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
              <CardTitle className="text-sm font-medium">
                Code Snippets
              </CardTitle>
              <Code2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSnippets}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-1 my-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/search">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-transparent hover:bg-accent-foreground hover:text-cyan-500"
                >
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
              <p className="text-sm text-muted-foreground mt-1">
                Organize your interview preparation by topic
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingTopic(undefined);
                setDialogOpen(true);
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
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first topic to get started
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Topic
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  qaCount={topicCounts[topic.id]?.qaCount ?? 0}
                  snippetCount={topicCounts[topic.id]?.snippetCount ?? 0}
                  onEdit={() => {
                    setEditingTopic(topic);
                    setDialogOpen(true);
                  }}
                  onDelete={() => setDeletingTopic(topic)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <TopicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        topic={editingTopic}
        onSave={handleSaveTopic}
      />

      <AlertDialog
        open={!!deletingTopic}
        onOpenChange={(open) => !open && setDeletingTopic(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTopic?.name}"? This will
              not delete the Q&A items and snippets associated with this topic.
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
  );
}
