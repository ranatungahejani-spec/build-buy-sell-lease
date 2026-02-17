"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <span className="text-sm font-semibold text-foreground">Buy Sell Lease</span>
          <p className="text-xs text-muted-foreground">Australian Real Estate Platform</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground" aria-label="Footer navigation">
          <Link href="/agencies" className="transition-colors hover:text-foreground">
            Agencies
          </Link>
          <Link href="/agents" className="transition-colors hover:text-foreground">
            Agents
          </Link>
          <Link href="/real-estate-services" className="transition-colors hover:text-foreground">
            Services
          </Link>
          <Link href="/real-estate-tools" className="transition-colors hover:text-foreground">
            Tools
          </Link>
          <Link href="/careers" className="transition-colors hover:text-foreground">
            Careers
          </Link>
        </nav>

        <div className="flex flex-col items-center gap-2 sm:items-end">
          <Button asChild variant="outline" size="sm">
            <Link href="/auth/portal-sign-in">Agent / Agency Sign In</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/consumer-sign-in">Consumer Sign In</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border py-4 text-center text-xs text-muted-foreground">
        <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
          <Link href="/terms">Terms and Conditions</Link>
        </Button>
        <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
          <Link href="/privacy">Privacy</Link>
        </Button>
        <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
          <Link href="/contact">Contact</Link>
        </Button>
      </div>
      <div className="border-t border-border py-2 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Buy Sell Lease. All rights reserved.
      </div>
    </footer>
  )
}
