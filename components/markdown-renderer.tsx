"use client"

import { memo, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import type { Components } from "react-markdown"
import "highlight.js/styles/github-dark.css"
import { cn } from "@/lib/utils"
import { RunnableCodeBlock } from "./runnable-code-block"

interface MarkdownRendererProps {
  content: string
  className?: string
  /** When true, fenced code blocks render as RunnableCodeBlock (Run/Copy). Use only for Q&A question/answer. */
  runnableCodeBlocks?: boolean
}

// Memoize plugin arrays to prevent unnecessary re-renders
const remarkPlugins = [remarkGfm]
const rehypePlugins = [rehypeSanitize, rehypeHighlight]

/** Extract raw text from React children (rehype-highlight turns code into elements, so children are not a plain string) */
function extractTextFromChildren(children: React.ReactNode): string {
  if (children == null) return ""
  if (typeof children === "string") return children
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join("")
  if (typeof children === "object" && "props" in children && children.props != null) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>
    return extractTextFromChildren(el.props.children)
  }
  return String(children)
}

const codeBlockPreClass = cn(
  "my-4 rounded-xl border border-border/80 overflow-hidden bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-200 p-4 text-sm font-mono border-l-4 border-primary/40"
)

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className = "",
  runnableCodeBlocks = true,
}: MarkdownRendererProps) {
  const containerClassName = useMemo(
    () =>
      `prose prose-slate dark:prose-invert max-w-none
       prose-headings:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/60
       prose-p:leading-relaxed prose-p:mb-4
       prose-ul:my-4 prose-li:my-1
       prose-code:bg-zinc-200 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
       ${className}`,
    [className]
  )

  const components = useMemo<Components>(
    () => ({
      pre({ node, children, className: preClassName, ...rest }) {
        const child = Array.isArray(children) ? children[0] : children
        const el = child && typeof child === "object" && "props" in child ? child as React.ReactElement<{ className?: string; children?: React.ReactNode }> : null
        const codeProps = el?.props
        const isCodeBlock = codeProps && (el?.type === "code" || (codeProps.className && /language-/.test(String(codeProps.className))))
        if (isCodeBlock && codeProps.className && runnableCodeBlocks) {
          const lang = String(codeProps.className).replace("language-", "").trim()
          const code = extractTextFromChildren(codeProps.children)
          return <RunnableCodeBlock code={code} language={lang} className="my-4" />
        }
        if (isCodeBlock && codeProps?.className) {
          const code = extractTextFromChildren(codeProps.children)
          return (
            <pre className={cn(codeBlockPreClass, preClassName)} {...rest}>
              <code>{code}</code>
            </pre>
          )
        }
        return (
          <pre className={cn(codeBlockPreClass, preClassName)} {...rest}>
            {children}
          </pre>
        )
      },
    }),
    [runnableCodeBlocks]
  )

  return (
    <div className={containerClassName}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
})
