"use client"

import { Sandpack } from "@codesandbox/sandpack-react"
import { githubLight, githubDark } from "@codesandbox/sandpack-themes"
import { useTheme } from "./theme-provider"
import type { SnippetLanguage } from "@/lib/types"

interface CodePreviewProps {
  code: string
  language: SnippetLanguage
}

export function CodePreview({ code, language }: CodePreviewProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  // For React/TSX/JSX, use Sandpack for interactive preview
  if (language === "tsx" || language === "jsx") {
    const template = language === "tsx" ? "react-ts" : "react"

    return (
      <Sandpack
        template={template}
        theme={isDark ? githubDark : githubLight}
        files={{
          "/App.tsx": code,
          "/App.jsx": code,
        }}
        options={{
          showNavigator: false,
          showTabs: false,
          showLineNumbers: true,
          editorHeight: 400,
        }}
      />
    )
  }

  // For other languages, show static preview
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted px-4 py-2 text-sm font-medium">Preview</div>
      <pre className="p-4 overflow-auto max-h-96">
        <code className="text-sm">{code}</code>
      </pre>
      {language === "html" && (
        <div className="border-t p-4">
          <div className="text-sm font-medium mb-2">Rendered Output:</div>
          <div className="border rounded p-4 bg-background" dangerouslySetInnerHTML={{ __html: code }} />
        </div>
      )}
    </div>
  )
}
