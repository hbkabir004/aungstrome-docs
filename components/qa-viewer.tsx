"use client"

import { X, Youtube, StickyNote, Edit3 } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { DifficultyBadge } from "./difficulty-badge"
import { MarkdownRenderer } from "./markdown-renderer"
import type { QAItem } from "@/lib/types"

interface QAViewerProps {
  item: QAItem
  onClose: () => void
  onEdit: () => void
}

export function QAViewer({ item, onClose, onEdit }: QAViewerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="container max-w-screen-lg py-6">
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
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* YouTube Link */}
        {item.youtubeLink && (
          <div className="mb-6 p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Youtube className="h-5 w-5 text-red-500" />
              <span className="font-semibold">Video Resource</span>
            </div>
            <a
              href={item.youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {item.youtubeLink}
            </a>
            {item.youtubeTimestamp && (
              <p className="text-sm text-muted-foreground mt-1">Timestamp: {item.youtubeTimestamp}</p>
            )}
          </div>
        )}

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-muted-foreground">Q:</span>
            Question
          </h2>
          <div className="rounded-lg border bg-card p-6">
            <MarkdownRenderer content={item.question} />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Answer */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary">A:</span>
            Answer
          </h2>
          <div className="rounded-lg border bg-card p-6">
            <MarkdownRenderer content={item.answer} />
          </div>
        </div>

        {/* Personal Notes */}
        {item.personalNotes && (
          <>
            <Separator className="my-8" />
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Personal Notes
              </h2>
              <div className="rounded-lg border bg-muted/50 p-6">
                <MarkdownRenderer content={item.personalNotes} />
              </div>
            </div>
          </>
        )}

        {/* Metadata */}
        <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
          <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
          <p>Last updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
