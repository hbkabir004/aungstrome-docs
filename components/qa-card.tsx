"use client"

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
  return (
    <Card className="group cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">{item.title}</CardTitle>
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.question.replace(/[#*`]/g, "").substring(0, 150)}...
        </p>
      </CardContent>
    </Card>
  )
}
