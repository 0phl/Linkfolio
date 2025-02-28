"use client"

import { useState } from "react"
import { ExternalLink, MoreHorizontal, Edit, Trash2, Globe } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import BookmarkForm from "@/components/bookmark-form"
import type { Bookmark, Category } from "@/types/bookmark"

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  categories: Category[]
  onUpdate: (bookmark: Bookmark) => void
  onDelete: (id: string) => void
}

export default function BookmarkGrid({ bookmarks, categories, onUpdate, onDelete }: BookmarkGridProps) {
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || "Uncategorized"
  }

  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`
    } catch (e) {
      return `https://www.google.com/s2/favicons?domain=example.com&sz=128`
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
        <Globe className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No bookmarks yet</h3>
        <p className="text-muted-foreground">Start adding your favorite websites to your collection.</p>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Bookmarks">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id} className="bookmark-card group" role="listitem">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-accent">
                <img
                  src={getFaviconUrl(bookmark.url) || "/placeholder.svg"}
                  alt={`${bookmark.title} favicon`}
                  className="w-6 h-6"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=24&width=24"
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate group-hover:text-primary transition-colors">{bookmark.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{bookmark.url.replace(/^https?:\/\//, "")}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Bookmark options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleEdit(bookmark)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(bookmark.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
          <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
            <Badge variant="secondary" className="capitalize">
              {getCategoryName(bookmark.categoryId)}
            </Badge>
            <Button size="sm" variant="ghost" asChild>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Visit ${bookmark.title}`}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Visit
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

