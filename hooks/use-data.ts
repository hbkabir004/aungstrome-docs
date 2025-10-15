"use client"

import useSWR from "swr"
import { useCallback } from "react"
import * as storage from "@/lib/storage"
import type { Topic, QAItem, Snippet } from "@/lib/types"

// Topics
export function useTopics() {
  const { data, error, mutate } = useSWR("topics", storage.getAllTopics, {
    fallbackData: [],
  })

  const createTopic = useCallback(
    async (topic: Topic) => {
      await storage.saveTopic(topic)
      mutate()
    },
    [mutate],
  )

  const updateTopic = useCallback(
    async (topic: Topic) => {
      await storage.saveTopic(topic)
      mutate()
    },
    [mutate],
  )

  const deleteTopic = useCallback(
    async (id: string) => {
      await storage.deleteTopic(id)
      mutate()
    },
    [mutate],
  )

  return {
    topics: data || [],
    isLoading: !error && !data,
    error,
    createTopic,
    updateTopic,
    deleteTopic,
    refresh: mutate,
  }
}

// QA Items
export function useQAItems(topicId?: string) {
  const fetcher = topicId ? () => storage.getQAItemsByTopic(topicId) : storage.getAllQAItems

  const { data, error, mutate } = useSWR(topicId ? `qaItems-${topicId}` : "qaItems", fetcher, {
    fallbackData: [],
  })

  const createQAItem = useCallback(
    async (item: QAItem) => {
      await storage.saveQAItem(item)
      mutate()
    },
    [mutate],
  )

  const updateQAItem = useCallback(
    async (item: QAItem) => {
      await storage.saveQAItem(item)
      mutate()
    },
    [mutate],
  )

  const deleteQAItem = useCallback(
    async (id: string) => {
      await storage.deleteQAItem(id)
      mutate()
    },
    [mutate],
  )

  return {
    qaItems: data || [],
    isLoading: !error && !data,
    error,
    createQAItem,
    updateQAItem,
    deleteQAItem,
    refresh: mutate,
  }
}

// Snippets
export function useSnippets(topicId?: string) {
  const fetcher = topicId ? () => storage.getSnippetsByTopic(topicId) : storage.getAllSnippets

  const { data, error, mutate } = useSWR(topicId ? `snippets-${topicId}` : "snippets", fetcher, {
    fallbackData: [],
  })

  const createSnippet = useCallback(
    async (snippet: Snippet) => {
      await storage.saveSnippet(snippet)
      mutate()
    },
    [mutate],
  )

  const updateSnippet = useCallback(
    async (snippet: Snippet) => {
      await storage.saveSnippet(snippet)
      mutate()
    },
    [mutate],
  )

  const deleteSnippet = useCallback(
    async (id: string) => {
      await storage.deleteSnippet(id)
      mutate()
    },
    [mutate],
  )

  return {
    snippets: data || [],
    isLoading: !error && !data,
    error,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    refresh: mutate,
  }
}
