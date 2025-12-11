"use client"

import { Navbar } from "@/components/navbar"
import type { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1C] via-[#0D1829] to-[#0A0F1C]">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
