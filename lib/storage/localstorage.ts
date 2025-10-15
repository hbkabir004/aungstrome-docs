// LocalStorage storage implementation (fallback/debugging)
import type { Topic, QAItem, Snippet, AppData } from "../types"

const STORAGE_KEYS = {
  topics: "aungstrome-docs:topics",
  qaItems: "aungstrome-docs:qaItems",
  snippets: "aungstrome-docs:snippets",
}

// Topics
export async function getAllTopics(): Promise<Topic[]> {
  const data = localStorage.getItem(STORAGE_KEYS.topics)
  return data ? JSON.parse(data) : []
}

export async function getTopic(id: string): Promise<Topic | undefined> {
  const topics = await getAllTopics()
  return topics.find((t) => t.id === id)
}

export async function saveTopic(topic: Topic): Promise<void> {
  const topics = await getAllTopics()
  const index = topics.findIndex((t) => t.id === topic.id)

  if (index >= 0) {
    topics[index] = topic
  } else {
    topics.push(topic)
  }

  localStorage.setItem(STORAGE_KEYS.topics, JSON.stringify(topics))
}

export async function deleteTopic(id: string): Promise<void> {
  const topics = await getAllTopics()
  const filtered = topics.filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.topics, JSON.stringify(filtered))
}

// QA Items
export async function getAllQAItems(): Promise<QAItem[]> {
  const data = localStorage.getItem(STORAGE_KEYS.qaItems)
  return data ? JSON.parse(data) : []
}

export async function getQAItem(id: string): Promise<QAItem | undefined> {
  const items = await getAllQAItems()
  return items.find((item) => item.id === id)
}

export async function getQAItemsByTopic(topicId: string): Promise<QAItem[]> {
  const items = await getAllQAItems()
  return items.filter((item) => item.topicId === topicId)
}

export async function saveQAItem(item: QAItem): Promise<void> {
  const items = await getAllQAItems()
  const index = items.findIndex((i) => i.id === item.id)

  if (index >= 0) {
    items[index] = item
  } else {
    items.push(item)
  }

  localStorage.setItem(STORAGE_KEYS.qaItems, JSON.stringify(items))
}

export async function deleteQAItem(id: string): Promise<void> {
  const items = await getAllQAItems()
  const filtered = items.filter((i) => i.id !== id)
  localStorage.setItem(STORAGE_KEYS.qaItems, JSON.stringify(filtered))
}

// Snippets
export async function getAllSnippets(): Promise<Snippet[]> {
  const data = localStorage.getItem(STORAGE_KEYS.snippets)
  return data ? JSON.parse(data) : []
}

export async function getSnippet(id: string): Promise<Snippet | undefined> {
  const snippets = await getAllSnippets()
  return snippets.find((s) => s.id === id)
}

export async function getSnippetsByTopic(topicId: string): Promise<Snippet[]> {
  const snippets = await getAllSnippets()
  return snippets.filter((s) => s.topicId === topicId)
}

export async function saveSnippet(snippet: Snippet): Promise<void> {
  const snippets = await getAllSnippets()
  const index = snippets.findIndex((s) => s.id === snippet.id)

  // Limit revisions to 50
  if (snippet.revisions.length > 50) {
    snippet.revisions = snippet.revisions.slice(-50)
  }

  if (index >= 0) {
    snippets[index] = snippet
  } else {
    snippets.push(snippet)
  }

  localStorage.setItem(STORAGE_KEYS.snippets, JSON.stringify(snippets))
}

export async function deleteSnippet(id: string): Promise<void> {
  const snippets = await getAllSnippets()
  const filtered = snippets.filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEYS.snippets, JSON.stringify(filtered))
}

// Bulk operations
export async function importData(data: AppData): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.topics, JSON.stringify(data.topics))
  localStorage.setItem(STORAGE_KEYS.qaItems, JSON.stringify(data.qaItems))
  localStorage.setItem(STORAGE_KEYS.snippets, JSON.stringify(data.snippets))
}

export async function exportData(): Promise<AppData> {
  const [topics, qaItems, snippets] = await Promise.all([getAllTopics(), getAllQAItems(), getAllSnippets()])

  return { topics, qaItems, snippets }
}

export async function clearAllData(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.topics)
  localStorage.removeItem(STORAGE_KEYS.qaItems)
  localStorage.removeItem(STORAGE_KEYS.snippets)
}
