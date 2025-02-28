import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

const BookmarkManager = dynamic(() => import("@/components/bookmark-manager"), {
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-accent/20">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <header className="text-center space-y-4 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              {process.env.NEXT_PUBLIC_APP_NAME}
            </h1>
            <p className="text-xl text-muted-foreground">Your personal space for organizing digital discoveries</p>
          </div>
          <div className="flex justify-center space-x-1">
            <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
            <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce animation-delay-200"></span>
            <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce animation-delay-400"></span>
          </div>
        </header>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <BookmarkManager />
        </Suspense>
      </div>
    </main>
  )
}

