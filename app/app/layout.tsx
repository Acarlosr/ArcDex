"use client"

import { Navbar } from "@/components/navbar"
import type { ReactNode } from "react"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </>
  )
}
