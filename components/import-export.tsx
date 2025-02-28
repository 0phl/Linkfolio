"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CloudIcon as CloudArrowDown, CloudIcon as CloudArrowUp, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { saveBookmark, saveCategory, getAllBookmarks, getAllCategories } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ImportExportProps {
  onImportComplete: () => void
}

export function ImportExport({ onImportComplete }: ImportExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const bookmarks = await getAllBookmarks()
      const categories = await getAllCategories()
      const data = { bookmarks, categories }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const date = new Date().toISOString().split("T")[0]
      link.download = `linkfolio-backup-${date}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast({
        title: "Backup created successfully",
        description: "Your bookmarks have been exported to a file.",
      })
    } catch (error) {
      toast({
        title: "Backup failed",
        description: "There was an error exporting your bookmarks.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const content = await file.text()
      const data = JSON.parse(content)

      if (!data.bookmarks || !data.categories) {
        throw new Error("Invalid backup file")
      }

      // Import categories first
      for (const category of data.categories) {
        await saveCategory(category)
      }

      // Then import bookmarks
      for (const bookmark of data.bookmarks) {
        await saveBookmark(bookmark)
      }

      toast({
        title: "Restore completed",
        description: `Successfully imported ${data.bookmarks.length} bookmarks.`,
      })
      onImportComplete()
    } catch (error) {
      toast({
        title: "Restore failed",
        description: "Please make sure you're using a valid backup file.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudArrowDown className="h-5 w-5" />
            Backup Collection
          </CardTitle>
          <CardDescription>Save your bookmarks to a file for safekeeping</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            {isExporting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
                Creating Backup...
              </>
            ) : (
              <>
                <CloudArrowDown className="mr-2 h-4 w-4" />
                Download Backup
              </>
            )}
          </Button>
        </CardContent>
        {/* Decorative corner */}
        <div className="absolute right-0 top-0 h-16 w-16 bg-primary/10 rounded-bl-[6rem]" />
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudArrowUp className="h-5 w-5" />
            Restore Collection
          </CardTitle>
          <CardDescription>Restore your bookmarks from a backup file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isImporting}
            className="hidden"
            id="file-upload"
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="w-full">
            {isImporting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
                Restoring...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Choose Backup File
              </>
            )}
          </Button>
        </CardContent>
        {/* Decorative corner */}
        <div className="absolute right-0 top-0 h-16 w-16 bg-primary/10 rounded-bl-[6rem]" />
      </Card>
    </div>
  )
}

