"use client"

import type React from "react"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Bookmark, Category } from "@/types/bookmark"
import { saveCategory } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Please enter a valid URL"),
  categoryId: z.string().min(1, "Please select a category"),
})

interface BookmarkFormProps {
  bookmark?: Bookmark
  onSubmit: (bookmark: Bookmark) => void
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
}

export default function BookmarkForm({ bookmark, onSubmit, categories, setCategories }: BookmarkFormProps) {
  const [newCategory, setNewCategory] = useState("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: bookmark?.title || "",
      url: bookmark?.url || "",
      categoryId: bookmark?.categoryId || "",
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        id: bookmark?.id || crypto.randomUUID(),
        title: values.title,
        url: values.url.startsWith("http") ? values.url : `https://${values.url}`,
        categoryId: values.categoryId,
        createdAt: bookmark?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      form.reset()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addCategory = async () => {
    if (newCategory.trim()) {
      try {
        const newCategoryObj = {
          id: crypto.randomUUID(),
          name: newCategory.trim(),
        }

        await saveCategory(newCategoryObj)
        setCategories([...categories, newCategoryObj])
        setNewCategory("")
        setIsAddingCategory(false)

        // Auto-select the new category
        form.setValue("categoryId", newCategoryObj.id)

        toast({
          title: "Category added",
          description: `Category "${newCategoryObj.name}" has been created.`,
        })
      } catch (error) {
        toast({
          title: "Error adding category",
          description: "There was a problem creating the category.",
          variant: "destructive",
        })
        console.error("Error adding category:", error)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">{bookmark ? "Edit Bookmark" : "Add New Bookmark"}</h2>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My Favorite Website" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="space-y-2">
                {isAddingCategory ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="New category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <Button type="button" onClick={addCategory}>
                      Add
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddingCategory(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsAddingCategory(true)}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
              {bookmark ? "Updating..." : "Saving..."}
            </>
          ) : bookmark ? (
            "Update Bookmark"
          ) : (
            "Save Bookmark"
          )}
        </Button>
      </form>
    </Form>
  )
}

