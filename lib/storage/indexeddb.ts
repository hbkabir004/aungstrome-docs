// IndexedDB storage implementation using idb
import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Topic, QAItem, Snippet, AppData } from "../types"

interface DocsDB extends DBSchema {
  topics: {
    key: string
    value: Topic
  }
  qaItems: {
    key: string
    value: QAItem
    indexes: { "by-topic": string }
  }
  snippets: {
    key: string
    value: Snippet
    indexes: { "by-topic": string }
  }
}

const DB_NAME = "aungstrome-docs"
const DB_VERSION = 1

let dbInstance: IDBPDatabase<DocsDB> | null = null

async function getDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<DocsDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create topics store
      if (!db.objectStoreNames.contains("topics")) {
        db.createObjectStore("topics", { keyPath: "id" })
      }

      // Create qaItems store with topic index
      if (!db.objectStoreNames.contains("qaItems")) {
        const qaStore = db.createObjectStore("qaItems", { keyPath: "id" })
        qaStore.createIndex("by-topic", "topicId")
      }

      // Create snippets store with topic index
      if (!db.objectStoreNames.contains("snippets")) {
        const snippetStore = db.createObjectStore("snippets", { keyPath: "id" })
        snippetStore.createIndex("by-topic", "topicId")
      }
    },
  })

  return dbInstance
}

// Topics
export async function getAllTopics(): Promise<Topic[]> {
  const db = await getDB()
  return db.getAll("topics")
}

export async function getTopic(id: string): Promise<Topic | undefined> {
  const db = await getDB()
  return db.get("topics", id)
}

export async function saveTopic(topic: Topic): Promise<void> {
  const db = await getDB()
  await db.put("topics", topic)
}

export async function deleteTopic(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("topics", id)
}

// QA Items
export async function getAllQAItems(): Promise<QAItem[]> {
  const db = await getDB()
  return db.getAll("qaItems")
}

export async function getQAItem(id: string): Promise<QAItem | undefined> {
  const db = await getDB()
  return db.get("qaItems", id)
}

export async function getQAItemsByTopic(topicId: string): Promise<QAItem[]> {
  const db = await getDB()
  return db.getAllFromIndex("qaItems", "by-topic", topicId)
}

export async function saveQAItem(item: QAItem): Promise<void> {
  const db = await getDB()
  await db.put("qaItems", item)
}

export async function deleteQAItem(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("qaItems", id)
}

// Snippets
export async function getAllSnippets(): Promise<Snippet[]> {
  const db = await getDB()
  return db.getAll("snippets")
}

export async function getSnippet(id: string): Promise<Snippet | undefined> {
  const db = await getDB()
  return db.get("snippets", id)
}

export async function getSnippetsByTopic(topicId: string): Promise<Snippet[]> {
  const db = await getDB()
  return db.getAllFromIndex("snippets", "by-topic", topicId)
}

export async function saveSnippet(snippet: Snippet): Promise<void> {
  const db = await getDB()
  // Limit revisions to 50
  if (snippet.revisions.length > 50) {
    snippet.revisions = snippet.revisions.slice(-50)
  }
  await db.put("snippets", snippet)
}

export async function deleteSnippet(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("snippets", id)
}

// Bulk operations
export async function importData(data: AppData): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(["topics", "qaItems", "snippets"], "readwrite")

  await Promise.all([
    ...data.topics.map((topic) => tx.objectStore("topics").put(topic)),
    ...data.qaItems.map((item) => tx.objectStore("qaItems").put(item)),
    ...data.snippets.map((snippet) => tx.objectStore("snippets").put(snippet)),
  ])

  await tx.done
}

export async function exportData(): Promise<AppData> {
  const [topics, qaItems, snippets] = await Promise.all([getAllTopics(), getAllQAItems(), getAllSnippets()])

  return { topics, qaItems, snippets }
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(["topics", "qaItems", "snippets"], "readwrite")

  await Promise.all([
    tx.objectStore("topics").clear(),
    tx.objectStore("qaItems").clear(),
    tx.objectStore("snippets").clear(),
  ])

  await tx.done
}
