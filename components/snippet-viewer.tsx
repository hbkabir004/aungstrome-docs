"use client"

import { X, Edit3, Copy, History } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { LanguageBadge } from "./language-badge"
import { CodePreview } from "./code-preview"
import type { Snippet } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface SnippetViewerProps {
  snippet: Snippet
  onClose: () => void
  onEdit: () => void
}

export function SnippetViewer({ snippet, onClose, onEdit }: SnippetViewerProps) {
  const { toast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code)
    toast({
      title: "Copied to clipboard",
      description: "Code snippet copied successfully",
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="container max-w-screen-xl py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">{snippet.title}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              <LanguageBadge language={snippet.language} />
              {snippet.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
              {snippet.revisions.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <History className="h-4 w-4" />
                  {snippet.revisions.length} revisions
                </Badge>
              )}
            </div>
            {snippet.description && <p className="text-muted-foreground">{snippet.description}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="mb-8">
          <CodePreview code={snippet.code} language={snippet.language} />
        </div>

        {/* Metadata */}
        <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
          <p>Created: {new Date(snippet.createdAt).toLocaleDateString()}</p>
          <p>Last updated: {new Date(snippet.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
