// Core data types for the documentation app

export type Difficulty = "easy" | "medium" | "hard"

export type SnippetLanguage = "tsx" | "jsx" | "javascript" | "html" | "css" | "css-in-js"

export interface Topic {
  id: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
}

export interface QAItem {
  id: string
  topicId: string
  title: string
  question: string // Markdown
  answer: string // Markdown
  tags: string[]
  difficulty: Difficulty
  youtubeLink?: string
  youtubeTimestamp?: string // Format: "1:23" or "1:23:45"
  personalNotes?: string // Markdown
  createdAt: number
  updatedAt: number
}

export interface SnippetRevision {
  code: string
  timestamp: number
  description?: string
}

export interface Snippet {
  id: string
  topicId: string
  title: string
  language: SnippetLanguage
  code: string
  description?: string
  tags: string[]
  revisions: SnippetRevision[]
  createdAt: number
  updatedAt: number
}

export interface AppData {
  topics: Topic[]
  qaItems: QAItem[]
  snippets: Snippet[]
}

export type StorageBackend = "indexeddb" | "localstorage"

export interface AppSettings {
  storageBackend: StorageBackend
  theme: "light" | "dark" | "system"
}
