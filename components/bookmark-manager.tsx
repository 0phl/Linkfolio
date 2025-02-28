"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Grid, List, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BookmarkForm from "@/components/bookmark-form"
import BookmarkList from "@/components/bookmark-list"
import BookmarkGrid from "@/components/bookmark-grid"
import type { Bookmark, Category } from "@/types/bookmark"
import {
  getAllBookmarks,
  saveBookmark,
  deleteBookmark as deleteBookmarkFromDB,
  getAllCategories,
  saveCategories,
} from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import { ImportExport } from "@/components/import-export"

export default function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Load bookmarks
      const dbBookmarks = await getAllBookmarks()
      setBookmarks(dbBookmarks)

      // Load categories
      const dbCategories = await getAllCategories()

      // If no categories exist, create default ones
      if (dbCategories.length === 0) {
        const defaultCategories = [
          { id: "1", name: "Work" },
          { id: "2", name: "Personal" },
          { id: "3", name: "Learning" },
        ]
        await saveCategories(defaultCategories)
        setCategories(defaultCategories)
      } else {
        setCategories(dbCategories)
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "There was a problem loading your bookmarks.",
        variant: "destructive",
      })
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Load data from IndexedDB on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  const addBookmark = async (bookmark: Bookmark) => {
    try {
      const savedBookmark = await saveBookmark(bookmark)
      setBookmarks([...bookmarks, savedBookmark])
      setIsFormOpen(false)
      toast({
        title: "Bookmark added",
        description: "Your bookmark has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error adding bookmark",
        description: "There was a problem saving your bookmark.",
        variant: "destructive",
      })
      console.error("Error adding bookmark:", error)
    }
  }

  const updateBookmark = async (updatedBookmark: Bookmark) => {
    try {
      await saveBookmark(updatedBookmark)
      setBookmarks(bookmarks.map((bookmark) => (bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark)))
      toast({
        title: "Bookmark updated",
        description: "Your bookmark has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error updating bookmark",
        description: "There was a problem updating your bookmark.",
        variant: "destructive",
      })
      console.error("Error updating bookmark:", error)
    }
  }

  const deleteBookmark = async (id: string) => {
    try {
      await deleteBookmarkFromDB(id)
      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id))
      toast({
        title: "Bookmark deleted",
        description: "Your bookmark has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error deleting bookmark",
        description: "There was a problem deleting your bookmark.",
        variant: "destructive",
      })
      console.error("Error deleting bookmark:", error)
    }
  }

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory ? bookmark.categoryId === activeCategory : true

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <ImportExport
        onImportComplete={() => {
          setIsLoading(true)
          loadData()
        }}
      />
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bookmarks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Bookmark
        </Button>
      </div>

      {isFormOpen && (
        <div className="relative p-6 border rounded-lg bg-card shadow-sm">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setIsFormOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
          <BookmarkForm onSubmit={addBookmark} categories={categories} setCategories={setCategories} />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex overflow-x-auto pb-2 gap-2">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
            className="whitespace-nowrap"
          >
            All Bookmarks
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? "s" : ""}
              </p>
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  List
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-6">
              <BookmarkGrid
                bookmarks={filteredBookmarks}
                categories={categories}
                onUpdate={updateBookmark}
                onDelete={deleteBookmark}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <BookmarkList
                bookmarks={filteredBookmarks}
                categories={categories}
                onUpdate={updateBookmark}
                onDelete={deleteBookmark}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

