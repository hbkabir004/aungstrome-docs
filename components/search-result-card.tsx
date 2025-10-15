"use client"

import { FileText, Code2, ExternalLink } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { DifficultyBadge } from "./difficulty-badge"
import { LanguageBadge } from "./language-badge"
import type { SearchResult } from "@/lib/search"
import type { QAItem, Snippet } from "@/lib/types"

interface SearchResultCardProps {
  result: SearchResult
  topicName: string
  onClick: () => void
}

export function SearchResultCard({ result, topicName, onClick }: SearchResultCardProps) {
  if (result.type === "qa") {
    const item = result.item as QAItem
    return (
      <Card className="cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {topicName}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Q&A
                </Badge>
              </div>
              <CardTitle className="text-base mb-2">{item.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <DifficultyBadge difficulty={item.difficulty} />
                {item.tags.slice(0, 3).map((tag) => (
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

  const snippet = result.item as Snippet
  return (
    <Card className="cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-green-500/10 p-2">
            <Code2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {topicName}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Snippet
              </Badge>
            </div>
            <CardTitle className="text-base mb-2">{snippet.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <LanguageBadge language={snippet.language} />
              {snippet.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {snippet.description && <p className="text-sm text-muted-foreground mb-2">{snippet.description}</p>}
        <pre className="text-xs bg-muted p-2 rounded overflow-hidden">
          <code className="line-clamp-2">{snippet.code}</code>
        </pre>
      </CardContent>
    </Card>
  )
}
