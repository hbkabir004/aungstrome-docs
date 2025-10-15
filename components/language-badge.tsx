import { Badge } from "./ui/badge"
import type { SnippetLanguage } from "@/lib/types"

interface LanguageBadgeProps {
  language: SnippetLanguage
}

export function LanguageBadge({ language }: LanguageBadgeProps) {
  const colors = {
    tsx: "bg-blue-500/10 text-blue-500",
    jsx: "bg-blue-400/10 text-blue-400",
    javascript: "bg-yellow-500/10 text-yellow-500",
    html: "bg-orange-500/10 text-orange-500",
    css: "bg-purple-500/10 text-purple-500",
    "css-in-js": "bg-pink-500/10 text-pink-500",
  }

  const labels = {
    tsx: "TSX",
    jsx: "JSX",
    javascript: "JavaScript",
    html: "HTML",
    css: "CSS",
    "css-in-js": "CSS-in-JS",
  }

  return (
    <Badge variant="secondary" className={colors[language]}>
      {labels[language]}
    </Badge>
  )
}
