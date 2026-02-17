"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { getToolProviderById } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ToolDashboardPage() {
  const session = useAuthStore((s) => s.session)
  const router = useRouter()

  useEffect(() => {
    if (!session || session.role !== "tool") {
      router.replace("/")
    }
  }, [session, router])

  if (!session || session.role !== "tool") return null

  const tp = getToolProviderById(session.userId)
  if (!tp) return <p className="text-muted-foreground">Profile not found.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tool Provider Dashboard</h1>
        <Badge variant={tp.status === "approved" ? "default" : "secondary"} className="capitalize">
          {tp.status}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3">
            {[
              ["Business Name", tp.businessName],
              ["Category", tp.toolCategory],
              ["Contact Person", tp.contactPerson],
              ["Email", tp.email],
              ["Phone", tp.phone],
              ["Address", tp.businessAddress],
              ["Coverage", tp.coverageAreas.map((a) => `${a.suburb} ${a.postcode}`).join("; ")],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                <dd className="text-right text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
