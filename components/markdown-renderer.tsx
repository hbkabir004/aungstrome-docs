"use client"

import { memo, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Memoize plugin arrays to prevent unnecessary re-renders
const remarkPlugins = [remarkGfm]
const rehypePlugins = [rehypeSanitize, rehypeHighlight]

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const containerClassName = useMemo(
    () => `prose prose-slate dark:prose-invert max-w-none ${className}`,
    [className]
  )

  return (
    <div className={containerClassName}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
        {content}
      </ReactMarkdown>
    </div>
  )
})
