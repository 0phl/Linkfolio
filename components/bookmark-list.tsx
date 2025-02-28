"use client"

import { useState } from "react"
import { ExternalLink, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import BookmarkForm from "@/components/bookmark-form"
import type { Bookmark, Category } from "@/types/bookmark"

interface BookmarkListProps {
  bookmarks: Bookmark[]
  categories: Category[]
  onUpdate: (bookmark: Bookmark) => void
  onDelete: (id: string) => void
}

export default function BookmarkList({ bookmarks, categories, onUpdate, onDelete }: BookmarkListProps) {
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || "Uncategorized"
  }

  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`
    } catch (e) {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=64`
    }
  }

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
  }

  const handleUpdate = (updatedBookmark: Bookmark) => {
    onUpdate(updatedBookmark)
    setEditingBookmark(null)
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No bookmarks found. Add your first bookmark!</p>
      </div>
    )
  }

  if (editingBookmark) {
    return (
      <div className="border rounded-lg p-6 bg-card shadow-sm">
        <BookmarkForm
          bookmark={editingBookmark}
          onSubmit={handleUpdate}
          categories={categories}
          setCategories={() => {}}
        />
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => setEditingBookmark(null)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center bg-muted">
            <img
              src={getFaviconUrl(bookmark.url) || "/placeholder.svg"}
              alt={bookmark.title}
              className="w-5 h-5"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=20&width=20"
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{bookmark.title}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground truncate">{bookmark.url}</p>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {getCategoryName(bookmark.categoryId)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" asChild>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Visit</span>
              </a>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleEdit(bookmark)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(bookmark.id)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

