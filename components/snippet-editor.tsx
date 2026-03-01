"use client"

import { useToast } from "@/hooks/use-toast"
import type { Snippet, SnippetLanguage, SnippetRevision } from "@/lib/types"
import { Copy, Eye, History, RotateCcw, X } from "lucide-react"
import { useEffect, useState } from "react"
import { CodePreview } from "./code-preview"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ScrollArea } from "./ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"

interface SnippetEditorProps {
  snippet?: Snippet
  topicId: string
  onSave: (snippet: Snippet) => void | Promise<void>
  onCancel: () => void
}

export function SnippetEditor({ snippet, topicId, onSave, onCancel }: SnippetEditorProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [language, setLanguage] = useState<SnippetLanguage>("tsx")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [showPreview, setShowPreview] = useState(true)
  const [showRevisions, setShowRevisions] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title)
      setLanguage(snippet.language)
      setCode(snippet.code)
      setDescription(snippet.description || "")
      setTags(snippet.tags)
    }
  }, [snippet])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    const now = Date.now()

    // Create new revision if code changed
    const revisions = snippet ? [...snippet.revisions] : []
    if (snippet && snippet.code !== code) {
      revisions.push({
        code: snippet.code,
        timestamp: snippet.updatedAt,
        description: "Previous version",
      })
    }

    const savedSnippet: Snippet = {
      id: snippet?.id || `snippet-${now}`,
      topicId,
      title,
      language,
      code,
      description: description || undefined,
      tags,
      revisions,
      createdAt: snippet?.createdAt || now,
      updatedAt: now,
    }
    setSaving(true)
    try {
      const result = onSave(savedSnippet)
      if (result && typeof (result as Promise<void>).then === "function") {
        await (result as Promise<void>)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code)
    toast({
      title: "Copied to clipboard",
      description: "Code copied successfully",
    })
  }

  const handleRevertToRevision = (revision: SnippetRevision) => {
    setCode(revision.code)
    setShowRevisions(false)
    toast({
      title: "Reverted to previous version",
      description: "Code has been restored from revision",
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">{snippet ? "Edit Snippet" : "New Snippet"}</h2>
          <div className="flex gap-2">
            {snippet && snippet.revisions.length > 0 && (
              <Button variant="outline" onClick={() => setShowRevisions(true)}>
                <History className="mr-2 h-4 w-4" />
                Revisions ({snippet.revisions.length})
              </Button>
            )}
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() || !code.trim() || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Editor */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., useMemo Example"
              />
            </div>

            {/* Language & Description */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={(value) => setLanguage(value as SnippetLanguage)}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tsx">React TSX</SelectItem>
                    <SelectItem value="jsx">React JSX</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="css-in-js">CSS-in-JS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Add tag..."
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this snippet..."
                rows={2}
              />
            </div>

            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="code">Code</Label>
                <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <Textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste or write your code here..."
                rows={20}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Preview</h3>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? "Hide" : "Show"}
                </Button>
              </div>

              {showPreview && code && <CodePreview code={code} language={language} />}

              {showPreview && !code && (
                <div className="rounded-lg border bg-card p-12 text-center">
                  <p className="text-sm text-muted-foreground">Start typing to see the preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revisions Dialog */}
      <Dialog open={showRevisions} onOpenChange={setShowRevisions}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Revision History</DialogTitle>
            <DialogDescription>View and restore previous versions of this snippet</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {snippet?.revisions.map((revision, index) => (
                <div key={revision.timestamp} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">Revision {snippet.revisions.length - index}</p>
                      <p className="text-sm text-muted-foreground">{new Date(revision.timestamp).toLocaleString()}</p>
                      {revision.description && <p className="text-sm text-muted-foreground">{revision.description}</p>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRevertToRevision(revision)}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                    <code>{revision.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
