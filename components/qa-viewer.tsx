"use client"

import type { QAItem } from "@/lib/types"
import { Edit3, Code2, StickyNote, Volume2, VolumeX, X, Youtube } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"
import { DifficultyBadge } from "./difficulty-badge"
import { MarkdownRenderer } from "./markdown-renderer"
import { CodePreview } from "./code-preview"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { useSnippets } from "@/hooks/use-data"

/** Strip markdown to plain text for speech (remove code blocks, links, bold, etc.) */
function markdownToPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_~`]/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

interface QAViewerProps {
  item: QAItem
  onClose: () => void
  onEdit: () => void
}

export function QAViewer({ item, onClose, onEdit }: QAViewerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const { snippets: topicSnippets } = useSnippets(item.topicId)
  const linkedSnippets = useMemo(() => {
    if (item.linkedSnippetIds && item.linkedSnippetIds.length > 0) {
      return item.linkedSnippetIds
        .map((id) => topicSnippets.find((s) => s.id === id))
        .filter(Boolean) as typeof topicSnippets
    }
    return topicSnippets
  }, [item.linkedSnippetIds, topicSnippets])

  const handleReadAloud = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const text = markdownToPlainText(item.answer)
    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1
    synthRef.current = utterance

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }, [item.answer, isSpeaking])

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">{item.title}</h1>
            <div className="flex flex-wrap gap-2">
              <DifficultyBadge difficulty={item.difficulty} />
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReadAloud}
              title={isSpeaking ? "Stop reading" : "Read answer aloud"}
              className={isSpeaking ? "text-primary" : ""}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="default" size="sm" className="gap-1.5" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* YouTube Link */}
        {item.youtubeLink && (
          <div className="mb-8 p-5 rounded-xl border border-border/80 bg-card shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Youtube className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-foreground">Video Resource</span>
            </div>
            <a
              href={item.youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline break-all"
            >
              {item.youtubeLink}
            </a>
            {item.youtubeTimestamp && (
              <p className="text-sm text-muted-foreground mt-1">Timestamp: {item.youtubeTimestamp}</p>
            )}
          </div>
        )}

        {/* Question – runnable code blocks enabled for Q&A */}
        <section className="mb-10" data-qa-section="question">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground font-bold text-sm">
              Q
            </span>
            <h2 className="text-xl font-semibold text-foreground">Question</h2>
          </div>
          <div className="rounded-xl border border-border/80 bg-card shadow-sm p-6 md:p-8">
            <MarkdownRenderer content={item.question} runnableCodeBlocks />
          </div>
        </section>

        <Separator className="my-10" />

        {/* Answer – runnable code blocks and linked snippets from this topic */}
        <section className="mb-10" data-qa-section="answer">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary font-bold text-sm">
              A
            </span>
            <h2 className="text-xl font-semibold text-foreground">Answer</h2>
          </div>
          <div className="rounded-xl border border-border/80 bg-card shadow-sm p-6 md:p-8 ring-1 ring-primary/5 space-y-8">
            <MarkdownRenderer content={item.answer} runnableCodeBlocks />
            {linkedSnippets.length > 0 && (
              <>
                <Separator className="my-8" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    Code examples
                  </h3>
                  <div className="space-y-6">
                    {linkedSnippets.map((snippet) => (
                      <div key={snippet.id} className="rounded-xl border border-border/80 overflow-hidden">
                        <div className="px-4 py-2 bg-muted/60 dark:bg-zinc-800/90 border-b border-border/60">
                          <span className="text-sm font-medium text-foreground">{snippet.title}</span>
                          {snippet.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{snippet.description}</p>
                          )}
                        </div>
                        <CodePreview code={snippet.code} language={snippet.language} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Personal Notes – no run button, just styled code */}
        {item.personalNotes && (
          <>
            <Separator className="my-10" />
            <section data-qa-section="notes">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 dark:bg-amber-400/15 text-amber-700 dark:text-amber-400">
                  <StickyNote className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-semibold text-foreground">Personal Notes</h2>
              </div>
              <div className="rounded-xl border border-border/80 bg-muted/40 dark:bg-muted/20 p-6 md:p-8">
                <MarkdownRenderer content={item.personalNotes} runnableCodeBlocks={false} />
              </div>
            </section>
          </>
        )}

        {/* Metadata */}
        <div className="mt-10 pt-6 border-t border-border/60 text-sm text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
          <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
          <span>Last updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
