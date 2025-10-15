"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import type { Topic } from "@/lib/types"

interface TopicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic?: Topic
  onSave: (topic: Topic) => void
}

export function TopicDialog({ open, onOpenChange, topic, onSave }: TopicDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (topic) {
      setName(topic.name)
      setDescription(topic.description || "")
    } else {
      setName("")
      setDescription("")
    }
  }, [topic, open])

  const handleSave = () => {
    const now = Date.now()
    const savedTopic: Topic = {
      id: topic?.id || `topic-${now}`,
      name,
      description: description || undefined,
      createdAt: topic?.createdAt || now,
      updatedAt: now,
    }
    onSave(savedTopic)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{topic ? "Edit Topic" : "Create Topic"}</DialogTitle>
          <DialogDescription>
            {topic ? "Update the topic details." : "Add a new topic to organize your Q&A and snippets."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., React Hooks" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this topic..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {topic ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
