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
import { BookOpen, Code2, FileText, GraduationCap, Plus, Search, Sparkles } from "lucide-react";
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading your docs...</p>
        </div>
      </div>
    );
  }

  const totalQA = qaItems.length;
  const totalSnippets = snippets.length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background gradient and grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-linear-to-b from-primary/5 via-transparent to-primary/5" />

      <main className="page-container relative z-10">
        {/* Hero Section */}
        <section className="mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Your <strong>own</strong> interview knowledge base</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground max-w-3xl">
            Interview Preparation{" "}
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              Docs
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
            Store Q&A, code snippets, and notes with runnable previews. Everything in one place, ready for your next technical interview.
          </p>
          <Link href="/search">
            <Button size="lg" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Search className="mr-2 h-4 w-4" />
              Search all content
            </Button>
          </Link>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3 mb-10">
          <Card className="group relative overflow-hidden border-border/80 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Topics</CardTitle>
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight text-foreground">{topics.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Organized by subject</p>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden border-border/80 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Q&A Items</CardTitle>
              <div className="rounded-xl bg-accent/20 p-2.5 text-accent group-hover:bg-accent/30 transition-colors">
                <FileText className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight text-foreground">{totalQA}</div>
              <p className="text-xs text-muted-foreground mt-1">Questions & answers</p>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden border-border/80 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Code Snippets</CardTitle>
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary group-hover:bg-primary/20 transition-colors">
                <Code2 className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight text-foreground">{totalSnippets}</div>
              <p className="text-xs text-muted-foreground mt-1">Runnable examples</p>
            </CardContent>
          </Card>
        </section>

        {/* Topics Section */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
                <GraduationCap className="h-7 w-7 text-primary" />
                Topics
              </h2>
              <p className="text-muted-foreground mt-1.5">
                Organize your prep by topic — open a topic to browse Q&A and snippets.
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingTopic(undefined);
                setDialogOpen(true);
              }}
              className="rounded-full shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Topic
            </Button>
          </div>

          {topics.length === 0 ? (
            <Card className="border-dashed border-2 border-primary/20 bg-card/50">
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="rounded-2xl bg-primary/10 p-5 mb-5">
                  <BookOpen className="h-14 w-14 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No topics yet</h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  Create your first topic to start adding Q&A and code snippets.
                </p>
                <Button onClick={() => setDialogOpen(true)} size="lg" className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first topic
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
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
              Are you sure you want to delete &quot;{deletingTopic?.name}&quot;? This will
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
