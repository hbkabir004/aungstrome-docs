"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type RunnableLanguage = "javascript" | "js" | "html" | "css" | "ts" | "typescript"

interface RunnableCodeBlockProps {
  code: string
  language: string
  className?: string
}

export function RunnableCodeBlock({ code, language, className = "" }: RunnableCodeBlockProps) {
  const [output, setOutput] = useState<string | null>(null)
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const lang = language?.replace("language-", "").toLowerCase().trim() as RunnableLanguage
  const canRun = ["javascript", "js", "html", "typescript", "ts"].includes(lang)

  const handleRun = useCallback(() => {
    if (!canRun) return
    setIsRunning(true)
    setOutput(null)
    setHtmlPreview(null)

    try {
      if (lang === "html") {
        setHtmlPreview(code)
        setOutput("[Rendered above]")
      } else {
        const isTS = lang === "typescript" || lang === "ts"
        const fn = new Function(`
          const log = (...args) => __out.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
          const __out = [];
          try {
            ${isTS ? "/* TS not executed */ " : ""}${code}
          } catch (e) {
            __out.push('Error: ' + e.message);
          }
          return __out.join('\\n');
        `)
        const result = fn()
        setOutput(result || "(no output)")
      }
    } catch (e) {
      setOutput("Error: " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setIsRunning(false)
    }
  }, [code, lang, canRun])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast({ title: "Copied to clipboard", description: "Code copied successfully" })
    setTimeout(() => setCopied(false), 2000)
  }, [code, toast])

  const showOutput = output !== null || htmlPreview !== null

  return (
    <div className={`rounded-xl border border-border/80 overflow-hidden shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/80 dark:bg-zinc-800/90 border-b border-border/60">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider tabular-nums">
          {language || "code"}
        </span>
        <div className="flex items-center gap-1">
          {canRun && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? <Square className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />}
              {isRunning ? "Running..." : "Run"}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      <pre className="p-4 overflow-auto max-h-80 text-sm leading-relaxed bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-200 border-l-4 border-primary/40">
        <code className="font-mono text-[13px]">{code}</code>
      </pre>
      {showOutput && (
        <div className="border-t border-border/60 bg-muted/40 dark:bg-zinc-800/50 px-4 py-3 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output</div>
          {htmlPreview && (
            <iframe
              title="Code output"
              sandbox="allow-scripts"
              srcDoc={htmlPreview}
              className="min-h-[120px] w-full rounded-lg border border-border/60 bg-white dark:bg-zinc-900 overflow-auto"
            />
          )}
          {output && output !== "[Rendered above]" && (
            <pre className="text-sm whitespace-pre-wrap wrap-break-word font-mono rounded-md bg-background/80 dark:bg-zinc-900/80 px-3 py-2 border border-border/40">{output}</pre>
          )}
        </div>
      )}
    </div>
  )
}
