import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Linkfolio - Organize Your Digital World",
  description: "A beautiful space to collect, organize, and access your favorite websites. Linkfolio helps you manage your bookmarks efficiently.",
  keywords: ["bookmarks", "organization", "productivity", "web app", "link management"],
  authors: [{ name: "Linkfolio Team" }],
  icons: [
    {
      rel: "icon",
      url: "/icon.svg",
      type: "image/svg+xml"
    }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'
