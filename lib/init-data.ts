// Initialize data on first load
import { getAllTopics, importData } from "./storage"
import { seedData } from "./seed-data"

const INIT_FLAG_KEY = "aungstrome-docs:initialized"

export async function initializeDataIfNeeded() {
  // Check if already initialized
  if (typeof window !== "undefined") {
    const initialized = localStorage.getItem(INIT_FLAG_KEY)
    if (initialized) return

    // Check if there's any existing data
    const topics = await getAllTopics()
    if (topics.length > 0) {
      localStorage.setItem(INIT_FLAG_KEY, "true")
      return
    }

    // Import seed data
    await importData(seedData)
    localStorage.setItem(INIT_FLAG_KEY, "true")
  }
}
