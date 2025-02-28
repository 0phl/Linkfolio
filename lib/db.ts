// Database service for IndexedDB operations

const DB_NAME = "bookmark-hub"
const DB_VERSION = 1
const BOOKMARK_STORE = "bookmarks"
const CATEGORY_STORE = "categories"

export interface DBBookmark {
  id: string
  title: string
  url: string
  categoryId: string
  createdAt: string
  updatedAt: string
}

export interface DBCategory {
  id: string
  name: string
}

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject("Error opening database")
    }

    request.onsuccess = (event) => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result

      // Create bookmark store
      if (!db.objectStoreNames.contains(BOOKMARK_STORE)) {
        const bookmarkStore = db.createObjectStore(BOOKMARK_STORE, { keyPath: "id" })
        bookmarkStore.createIndex("categoryId", "categoryId", { unique: false })
        bookmarkStore.createIndex("title", "title", { unique: false })
        bookmarkStore.createIndex("url", "url", { unique: false })
      }

      // Create category store
      if (!db.objectStoreNames.contains(CATEGORY_STORE)) {
        const categoryStore = db.createObjectStore(CATEGORY_STORE, { keyPath: "id" })
        categoryStore.createIndex("name", "name", { unique: false })
      }
    }
  })
}

// Get all bookmarks
export const getAllBookmarks = async (): Promise<DBBookmark[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BOOKMARK_STORE, "readonly")
    const store = transaction.objectStore(BOOKMARK_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject("Error fetching bookmarks")
    }
  })
}

// Add or update a bookmark
export const saveBookmark = async (bookmark: DBBookmark): Promise<DBBookmark> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BOOKMARK_STORE, "readwrite")
    const store = transaction.objectStore(BOOKMARK_STORE)
    const request = store.put(bookmark)

    request.onsuccess = () => {
      resolve(bookmark)
    }

    request.onerror = () => {
      reject("Error saving bookmark")
    }
  })
}

// Delete a bookmark
export const deleteBookmark = async (id: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BOOKMARK_STORE, "readwrite")
    const store = transaction.objectStore(BOOKMARK_STORE)
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject("Error deleting bookmark")
    }
  })
}

// Get all categories
export const getAllCategories = async (): Promise<DBCategory[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CATEGORY_STORE, "readonly")
    const store = transaction.objectStore(CATEGORY_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject("Error fetching categories")
    }
  })
}

// Add or update a category
export const saveCategory = async (category: DBCategory): Promise<DBCategory> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CATEGORY_STORE, "readwrite")
    const store = transaction.objectStore(CATEGORY_STORE)
    const request = store.put(category)

    request.onsuccess = () => {
      resolve(category)
    }

    request.onerror = () => {
      reject("Error saving category")
    }
  })
}

// Add multiple categories at once
export const saveCategories = async (categories: DBCategory[]): Promise<DBCategory[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CATEGORY_STORE, "readwrite")
    const store = transaction.objectStore(CATEGORY_STORE)

    let completed = 0
    let hasError = false

    categories.forEach((category) => {
      const request = store.put(category)

      request.onsuccess = () => {
        completed++
        if (completed === categories.length && !hasError) {
          resolve(categories)
        }
      }

      request.onerror = () => {
        if (!hasError) {
          hasError = true
          reject("Error saving categories")
        }
      }
    })

    // Handle empty array case
    if (categories.length === 0) {
      resolve([])
    }
  })
}

