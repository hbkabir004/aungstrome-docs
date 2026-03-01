"use client"

import type React from "react"
import type { QAItem } from "@/lib/types"
import { ExternalLink, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { DifficultyBadge } from "./difficulty-badge"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

interface QACardProps {
  item: QAItem
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}

export function QACard({ item, onEdit, onDelete, onClick }: QACardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit()
  }
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete()
  }
  return (
    <Card className="group cursor-pointer transition-all duration-200 ease-out hover:shadow-lg hover:border-primary/20" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <CardTitle className="text-base truncate">{item.title}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <DifficultyBadge difficulty={item.difficulty} />
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.youtubeLink && (
                <Badge variant="outline" className="text-xs gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Video
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onEdit(); }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onDelete(); }} variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.question.replace(/[#*`]/g, "").substring(0, 150)}...
        </p>
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="sm" className="flex-1 gap-1.5" onClick={handleEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
