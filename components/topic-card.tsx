"use client"

import { memo } from "react"
import Link from "next/link"
import { BookOpen, FileText, Code2, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import type { Topic } from "@/lib/types"

interface TopicCardProps {
  topic: Topic
  qaCount: number
  snippetCount: number
  onEdit: () => void
  onDelete: () => void
}

export const TopicCard = memo(function TopicCard({ topic, qaCount, snippetCount, onEdit, onDelete }: TopicCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{topic.name}</CardTitle>
              {topic.description && <CardDescription className="mt-1">{topic.description}</CardDescription>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link
            href={`/topics/${topic.id}/qa`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>{qaCount} Q&A</span>
          </Link>
          <Link
            href={`/topics/${topic.id}/snippets`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Code2 className="h-4 w-4" />
            <span>{snippetCount} Snippets</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
})
