"use client"

import type { Difficulty, QAItem } from "@/lib/types"
import { Code2, Eye, X, Youtube } from "lucide-react"
import { useEffect, useState } from "react"
import { useSnippets } from "@/hooks/use-data"
import { MarkdownRenderer } from "./markdown-renderer"
import { Checkbox } from "./ui/checkbox"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Textarea } from "./ui/textarea"

interface QAEditorProps {
  item?: QAItem
  topicId: string
  onSave: (item: QAItem) => void | Promise<void>
  onCancel: () => void
}

export function QAEditor({ item, topicId, onSave, onCancel }: QAEditorProps) {
  const [title, setTitle] = useState("")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [youtubeLink, setYoutubeLink] = useState("")
  const [youtubeTimestamp, setYoutubeTimestamp] = useState("")
  const [personalNotes, setPersonalNotes] = useState("")
  const [linkedSnippetIds, setLinkedSnippetIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"question" | "answer" | "notes">("question")
  const [saving, setSaving] = useState(false)
  const { snippets: topicSnippets } = useSnippets(topicId)

  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setQuestion(item.question)
      setAnswer(item.answer)
      setDifficulty(item.difficulty)
      setTags(item.tags)
      setYoutubeLink(item.youtubeLink || "")
      setYoutubeTimestamp(item.youtubeTimestamp || "")
      setPersonalNotes(item.personalNotes || "")
      setLinkedSnippetIds(item.linkedSnippetIds ?? [])
    } else {
      setLinkedSnippetIds([])
    }
  }, [item])

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
    const savedItem: QAItem = {
      id: item?.id || `qa-${now}`,
      topicId,
      title,
      question,
      answer,
      tags,
      difficulty,
      youtubeLink: youtubeLink || undefined,
      youtubeTimestamp: youtubeTimestamp || undefined,
      personalNotes: personalNotes || undefined,
      linkedSnippetIds: linkedSnippetIds.length > 0 ? linkedSnippetIds : undefined,
      createdAt: item?.createdAt || now,
      updatedAt: now,
    }
    setSaving(true)
    try {
      const result = onSave(savedItem)
      if (result && typeof (result as Promise<void>).then === "function") {
        await (result as Promise<void>)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">{item ? "Edit Q&A" : "New Q&A"}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() || !question.trim() || !answer.trim() || saving}>
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
                placeholder="e.g., useMemo vs useCallback"
              />
            </div>

            {/* Difficulty & Tags */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
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

            {/* YouTube Link */}
            <div className="space-y-2">
              <Label htmlFor="youtube" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube Link (optional)
              </Label>
              <Input
                id="youtube"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {youtubeLink && (
              <div className="space-y-2">
                <Label htmlFor="timestamp">Timestamp (optional)</Label>
                <Input
                  id="timestamp"
                  value={youtubeTimestamp}
                  onChange={(e) => setYoutubeTimestamp(e.target.value)}
                  placeholder="e.g., 1:23 or 1:23:45"
                />
              </div>
            )}

            {/* Code examples from this topic – show in this Q&A */}
            {topicSnippets.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Code examples in this Q&A
                </Label>
                <p className="text-xs text-muted-foreground">
                  Select which snippets to show when viewing this Q&A. If none selected, all snippets from this topic are shown.
                </p>
                <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/30 p-3">
                  {topicSnippets.map((snippet) => (
                    <label key={snippet.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={linkedSnippetIds.includes(snippet.id)}
                        onCheckedChange={(checked) => {
                          setLinkedSnippetIds((prev) =>
                            checked ? [...prev, snippet.id] : prev.filter((id) => id !== snippet.id)
                          )
                        }}
                      />
                      <span className="text-sm font-medium">{snippet.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Markdown Editors */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="question">Question</TabsTrigger>
                <TabsTrigger value="answer">Answer</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="question" className="space-y-2">
                <Label htmlFor="question">Question (Markdown)</Label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="## Question&#10;&#10;Write your question in Markdown..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="answer" className="space-y-2">
                <Label htmlFor="answer">Answer (Markdown)</Label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="## Answer&#10;&#10;Write your answer in Markdown..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="notes" className="space-y-2">
                <Label htmlFor="notes">Personal Notes (Markdown, optional)</Label>
                <Textarea
                  id="notes"
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="Add your personal notes..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Preview</h3>
              </div>

              <div className="rounded-lg border bg-card p-6 space-y-6">
                {activeTab === "question" && question && <MarkdownRenderer content={question} runnableCodeBlocks />}
                {activeTab === "answer" && answer && <MarkdownRenderer content={answer} runnableCodeBlocks />}
                {activeTab === "notes" && personalNotes && <MarkdownRenderer content={personalNotes} runnableCodeBlocks={false} />}
                {((activeTab === "question" && !question) ||
                  (activeTab === "answer" && !answer) ||
                  (activeTab === "notes" && !personalNotes)) && (
                  <p className="text-sm text-muted-foreground text-center py-8">Start typing to see the preview...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
