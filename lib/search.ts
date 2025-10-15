// Search utilities using Fuse.js
import Fuse from "fuse.js"
import type { QAItem, Snippet } from "./types"

// QA Items search configuration
const qaSearchOptions: Fuse.IFuseOptions<QAItem> = {
  keys: [
    { name: "title", weight: 2 },
    { name: "question", weight: 1.5 },
    { name: "answer", weight: 1.5 },
    { name: "tags", weight: 1 },
    { name: "personalNotes", weight: 0.5 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
}

// Snippets search configuration
const snippetSearchOptions: Fuse.IFuseOptions<Snippet> = {
  keys: [
    { name: "title", weight: 2 },
    { name: "description", weight: 1.5 },
    { name: "code", weight: 1 },
    { name: "tags", weight: 1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
}

export function searchQAItems(items: QAItem[], query: string): QAItem[] {
  if (!query.trim()) return items

  const fuse = new Fuse(items, qaSearchOptions)
  const results = fuse.search(query)
  return results.map((result) => result.item)
}

export function searchSnippets(snippets: Snippet[], query: string): Snippet[] {
  if (!query.trim()) return snippets

  const fuse = new Fuse(snippets, snippetSearchOptions)
  const results = fuse.search(query)
  return results.map((result) => result.item)
}

export type SearchResult = {
  type: "qa" | "snippet"
  item: QAItem | Snippet
  topicId: string
}

export function searchAll(qaItems: QAItem[], snippets: Snippet[], query: string): SearchResult[] {
  if (!query.trim()) {
    return [
      ...qaItems.map((item) => ({ type: "qa" as const, item, topicId: item.topicId })),
      ...snippets.map((item) => ({ type: "snippet" as const, item, topicId: item.topicId })),
    ]
  }

  const qaResults = searchQAItems(qaItems, query).map((item) => ({
    type: "qa" as const,
    item,
    topicId: item.topicId,
  }))

  const snippetResults = searchSnippets(snippets, query).map((item) => ({
    type: "snippet" as const,
    item,
    topicId: item.topicId,
  }))

  return [...qaResults, ...snippetResults]
}
