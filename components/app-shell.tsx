"use client"

import React, { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate)
  const hydrated = useAuthStore((s) => s.hydrated)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
