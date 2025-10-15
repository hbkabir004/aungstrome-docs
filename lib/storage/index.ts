// Storage abstraction layer - switches between IndexedDB and LocalStorage
import type { Topic, QAItem, Snippet, AppData, StorageBackend } from "../types"
import * as indexedDBStorage from "./indexeddb"
import * as localStorageStorage from "./localstorage"

let currentBackend: StorageBackend = "indexeddb"

export function setStorageBackend(backend: StorageBackend) {
  currentBackend = backend
}

export function getStorageBackend(): StorageBackend {
  return currentBackend
}

function getStorage() {
  return currentBackend === "indexeddb" ? indexedDBStorage : localStorageStorage
}

// Topics
export async function getAllTopics(): Promise<Topic[]> {
  return getStorage().getAllTopics()
}

export async function getTopic(id: string): Promise<Topic | undefined> {
  return getStorage().getTopic(id)
}

export async function saveTopic(topic: Topic): Promise<void> {
  return getStorage().saveTopic(topic)
}

export async function deleteTopic(id: string): Promise<void> {
  return getStorage().deleteTopic(id)
}

// QA Items
export async function getAllQAItems(): Promise<QAItem[]> {
  return getStorage().getAllQAItems()
}

export async function getQAItem(id: string): Promise<QAItem | undefined> {
  return getStorage().getQAItem(id)
}

export async function getQAItemsByTopic(topicId: string): Promise<QAItem[]> {
  return getStorage().getQAItemsByTopic(topicId)
}

export async function saveQAItem(item: QAItem): Promise<void> {
  return getStorage().saveQAItem(item)
}

export async function deleteQAItem(id: string): Promise<void> {
  return getStorage().deleteQAItem(id)
}

// Snippets
export async function getAllSnippets(): Promise<Snippet[]> {
  return getStorage().getAllSnippets()
}

export async function getSnippet(id: string): Promise<Snippet | undefined> {
  return getStorage().getSnippet(id)
}

export async function getSnippetsByTopic(topicId: string): Promise<Snippet[]> {
  return getStorage().getSnippetsByTopic(topicId)
}

export async function saveSnippet(snippet: Snippet): Promise<void> {
  return getStorage().saveSnippet(snippet)
}

export async function deleteSnippet(id: string): Promise<void> {
  return getStorage().deleteSnippet(id)
}

// Bulk operations
export async function importData(data: AppData): Promise<void> {
  return getStorage().importData(data)
}

export async function exportData(): Promise<AppData> {
  return getStorage().exportData()
}

export async function clearAllData(): Promise<void> {
  return getStorage().clearAllData()
}
