"use client"

import type { SnippetLanguage } from "@/lib/types"
import { Sandpack } from "@codesandbox/sandpack-react"
import { githubLight, nightOwl } from "@codesandbox/sandpack-themes"
import { Play, Square } from "lucide-react"
import { memo, useCallback, useMemo, useState } from "react"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"

interface CodePreviewProps {
  code: string
  language: SnippetLanguage
}

export const CodePreview = memo(function CodePreview({ code, language }: CodePreviewProps) {
  const { theme } = useTheme()
  const [jsOutput, setJsOutput] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const isDark = useMemo(() => {
    if (typeof window === "undefined") return false
    return theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  }, [theme])

  const sandpackTheme = isDark ? nightOwl : githubLight

  /** Ensure React/TSX/JSX has a default export and provide props so Sandpack can render without "undefined" errors */
  const normalizeReactCode = useCallback((raw: string, isTS: boolean): string => {
    const hasDefaultExport = /\bexport\s+default\s+/.test(raw)
    if (hasDefaultExport) return raw
    const namedFunctionMatch = raw.match(/\bexport\s+function\s+(\w+)\s*[<(]/)
    const namedConstMatch = raw.match(/\bexport\s+const\s+(\w+)\s*[=:]/)
    const namedClassMatch = raw.match(/\bexport\s+class\s+(\w+)\s+/)
    const name = namedFunctionMatch?.[1] ?? namedConstMatch?.[1] ?? namedClassMatch?.[1]
    if (!name) return raw
    // Export a wrapper that passes sample props so the component isn't rendered with undefined (e.g. items.filter)
    const sampleItems = "['Apple', 'Banana', 'Apricot', 'Avocado', 'Mango']"
    const wrapper = `\n\nexport default function App() {\n  return <${name} items={${sampleItems}} filter="a" />;\n}\n`
    return raw.trimEnd() + wrapper
  }, [])

  const runJavaScript = useCallback(() => {
    if (language !== "javascript") return
    setIsRunning(true)
    setJsOutput(null)
    try {
      const fn = new Function(`
        const log = (...args) => __out.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        const __out = [];
        try { ${code} } catch (e) { __out.push('Error: ' + e.message); }
        return __out.join('\\n');
      `)
      setJsOutput(fn() || "(no output)")
    } catch (e) {
      setJsOutput("Error: " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setIsRunning(false)
    }
  }, [code, language])

  // For React/TSX/JSX, use Sandpack for interactive preview
  if (language === "tsx" || language === "jsx") {
    const template = language === "tsx" ? "react-ts" : "react"
    const appCode = normalizeReactCode(code, language === "tsx")

    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <Sandpack
          template={template}
          theme={sandpackTheme}
          files={
            language === "tsx"
              ? { "/App.tsx": appCode }
              : { "/App.jsx": appCode }
          }
          options={{
            showNavigator: false,
            showTabs: false,
            showLineNumbers: true,
            editorHeight: 400,
          }}
        />
      </div>
    )
  }

  // For JavaScript: code + Run button + output
  if (language === "javascript") {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-muted/60 border-b">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">JavaScript</span>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={runJavaScript} disabled={isRunning}>
            {isRunning ? <Square className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
        <pre className="p-4 overflow-auto max-h-96 text-sm">
          <code>{code}</code>
        </pre>
        {jsOutput !== null && (
          <div className="border-t bg-muted/30 px-4 py-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Output</div>
            <pre className="text-sm whitespace-pre-wrap wrap-break-word font-mono">{jsOutput}</pre>
          </div>
        )}
      </div>
    )
  }

  // For HTML: code + rendered output (iframe for safety)
  if (language === "html") {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
          HTML
        </div>
        <pre className="p-4 overflow-auto max-h-72 text-sm">
          <code>{code}</code>
        </pre>
        <div className="border-t p-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">Rendered output</div>
          <iframe
            title="HTML preview"
            sandbox="allow-scripts"
            srcDoc={code}
            className="w-full min-h-[200px] rounded-lg border bg-white dark:bg-zinc-900 overflow-auto"
          />
        </div>
      </div>
    )
  }

  // For other languages (css, css-in-js): static preview
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="bg-muted/60 px-4 py-2 text-sm font-medium border-b">Preview</div>
      <pre className="p-4 overflow-auto max-h-96">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  )
})
