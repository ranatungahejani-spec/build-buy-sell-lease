"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState } from "react"

const NAV_ITEMS = [
  { label: "Properties", href: "/properties" },
  { label: "Agents", href: "/agents" },
  { label: "Agencies", href: "/agencies" },
  { label: "Real Estate Services", href: "/real-estate-services" },
  { label: "Real Estate Tools", href: "/real-estate-tools" },
  { label: "Careers", href: "/careers" },
]

function getProfileHref(role: string | undefined) {
  switch (role) {
    case "consumer": return "/profile"
    case "agency": return "/dashboard/agency"
    case "agent": return "/dashboard/agent"
    case "service": return "/dashboard/service"
    case "tool": return "/dashboard/tool"
    case "admin": return "/admin/approvals"
    default: return "/profile"
  }
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const signOut = useAuthStore((s) => s.signOut)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          Buy Sell Lease
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                pathname.startsWith(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(getProfileHref(session.role))}
              >
                <User className="mr-1 h-4 w-4" />
                {session.name}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut()
                  router.push("/")
                }}
              >
                <LogOut className="mr-1 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/auth/consumer-sign-in")}
            >
              Sign In / Join Now
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  pathname.startsWith(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-2">
            {session ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    router.push(getProfileHref(session.role))
                    setMobileOpen(false)
                  }}
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    signOut()
                    router.push("/")
                    setMobileOpen(false)
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => {
                  router.push("/auth/consumer-sign-in")
                  setMobileOpen(false)
                }}
              >
                Sign In / Join Now
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
