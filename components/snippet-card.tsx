"use client"

import type React from "react"
import { memo, useCallback } from "react"

import { Code2, MoreVertical, Pencil, Trash2, Copy, History } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { LanguageBadge } from "./language-badge"
import type { Snippet } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface SnippetCardProps {
  snippet: Snippet
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}

export const SnippetCard = memo(function SnippetCard({ snippet, onEdit, onDelete, onClick }: SnippetCardProps) {
  const { toast } = useToast()

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(snippet.code)
    toast({
      title: "Copied to clipboard",
      description: "Code snippet copied successfully",
    })
  }

  return (
    <Card className="group cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">{snippet.title}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <LanguageBadge language={snippet.language} />
              {snippet.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {snippet.revisions.length > 0 && (
                <Badge variant="outline" className="text-xs gap-1">
                  <History className="h-3 w-3" />
                  {snippet.revisions.length} revisions
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {snippet.description && <p className="text-sm text-muted-foreground mb-3">{snippet.description}</p>}
        <pre className="text-xs bg-muted p-3 rounded overflow-hidden">
          <code className="line-clamp-3">{snippet.code}</code>
        </pre>
      </CardContent>
    </Card>
  )
})
