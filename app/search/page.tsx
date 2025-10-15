"use client"

import { QAViewer } from "@/components/qa-viewer"
import { SearchResultCard } from "@/components/search-result-card"
import { SnippetViewer } from "@/components/snippet-viewer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQAItems, useSnippets, useTopics } from "@/hooks/use-data"
import { searchAll } from "@/lib/search"
import type { Difficulty, QAItem, Snippet, SnippetLanguage } from "@/lib/types"
import { Filter, Search, X } from "lucide-react"
import { useMemo, useState } from "react"

type SortOption = "relevance" | "recent" | "oldest" | "alphabetical"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<"all" | "qa" | "snippet">("all")
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<SnippetLanguage[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("relevance")
  const [viewingQA, setViewingQA] = useState<QAItem | undefined>()
  const [viewingSnippet, setViewingSnippet] = useState<Snippet | undefined>()

  const { topics } = useTopics()
  const { qaItems, updateQAItem } = useQAItems()
  const { snippets, updateSnippet } = useSnippets()

  // Search and filter results
  const results = useMemo(() => {
    let filtered = searchAll(qaItems, snippets, query)

    // Filter by topic
    if (selectedTopic !== "all") {
      filtered = filtered.filter((r) => r.topicId === selectedTopic)
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((r) => r.type === selectedType)
    }

    // Filter by difficulty (QA only)
    if (selectedDifficulties.length > 0) {
      filtered = filtered.filter((r) => {
        if (r.type === "qa") {
          return selectedDifficulties.includes((r.item as QAItem).difficulty)
        }
        return true
      })
    }

    // Filter by language (Snippets only)
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter((r) => {
        if (r.type === "snippet") {
          return selectedLanguages.includes((r.item as Snippet).language)
        }
        return true
      })
    }

    // Sort results
    if (sortBy === "recent") {
      filtered.sort((a, b) => b.item.updatedAt - a.item.updatedAt)
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => a.item.createdAt - b.item.createdAt)
    } else if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.item.title.localeCompare(b.item.title))
    }

    return filtered
  }, [query, qaItems, snippets, selectedTopic, selectedType, selectedDifficulties, selectedLanguages, sortBy])

  const activeFiltersCount =
    (selectedTopic !== "all" ? 1 : 0) +
    (selectedType !== "all" ? 1 : 0) +
    selectedDifficulties.length +
    selectedLanguages.length

  const clearFilters = () => {
    setSelectedTopic("all")
    setSelectedType("all")
    setSelectedDifficulties([])
    setSelectedLanguages([])
  }

  const toggleDifficulty = (difficulty: Difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty],
    )
  }

  const toggleLanguage = (language: SnippetLanguage) => {
    setSelectedLanguages((prev) => (prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]))
  }

  if (viewingQA) {
    return (
      <QAViewer
        item={viewingQA}
        onClose={() => setViewingQA(undefined)}
        onEdit={() => {
          // For now, just close the viewer
          setViewingQA(undefined)
        }}
      />
    )
  }

  if (viewingSnippet) {
    return (
      <SnippetViewer
        snippet={viewingSnippet}
        onClose={() => setViewingSnippet(undefined)}
        onEdit={() => {
          // For now, just close the viewer
          setViewingSnippet(undefined)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="page-container px-2 sm:px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1 sm:gap-0">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Search</h1>
          <p className="text-muted-foreground">Search across all your Q&A items and code snippets</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, content, tags..."
              className="pl-10 h-12 text-base w-full"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 overflow-x-auto pb-2 -mx-2 px-2">
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-48 min-w-[10rem]">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="qa">Q&A Only</SelectItem>
              <SelectItem value="snippet">Snippets Only</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                More Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Difficulty (Q&A)</h4>
                  <div className="space-y-2">
                    {(["easy", "medium", "hard"] as Difficulty[]).map((difficulty) => (
                      <div key={difficulty} className="flex items-center space-x-2">
                        <Checkbox
                          id={`difficulty-${difficulty}`}
                          checked={selectedDifficulties.includes(difficulty)}
                          onCheckedChange={() => toggleDifficulty(difficulty)}
                        />
                        <Label htmlFor={`difficulty-${difficulty}`} className="cursor-pointer capitalize">
                          {difficulty}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Language (Snippets)</h4>
                  <div className="space-y-2">
                    {(["tsx", "jsx", "javascript", "html", "css", "css-in-js"] as SnippetLanguage[]).map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={`language-${language}`}
                          checked={selectedLanguages.includes(language)}
                          onCheckedChange={() => toggleLanguage(language)}
                        />
                        <Label htmlFor={`language-${language}`} className="cursor-pointer">
                          {language.toUpperCase()}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"} found
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search query or filters</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => {
              const topic = topics.find((t) => t.id === result.topicId)
              return (
                <SearchResultCard
                  key={`${result.type}-${result.item.id}`}
                  result={result}
                  topicName={topic?.name || "Unknown"}
                  onClick={() => {
                    if (result.type === "qa") {
                      setViewingQA(result.item as QAItem)
                    } else {
                      setViewingSnippet(result.item as Snippet)
                    }
                  }}
                />
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
