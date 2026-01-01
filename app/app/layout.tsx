"use client"

import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import type { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-6 py-8">{children}</main>
      <Toaster />
    </div>
  )
}
