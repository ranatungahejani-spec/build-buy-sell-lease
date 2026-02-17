"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { getServiceProviderById } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ServiceDashboardPage() {
  const session = useAuthStore((s) => s.session)
  const router = useRouter()

  useEffect(() => {
    if (!session || session.role !== "service") {
      router.replace("/")
    }
  }, [session, router])

  if (!session || session.role !== "service") return null

  const sp = getServiceProviderById(session.userId)
  if (!sp) return <p className="text-muted-foreground">Profile not found.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Service Provider Dashboard</h1>
        <Badge variant={sp.status === "approved" ? "default" : "secondary"} className="capitalize">
          {sp.status}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3">
            {[
              ["Business Name", sp.businessName],
              ["Email", sp.email],
              ["Phone", sp.phone],
              ["Address", sp.address],
              ["Categories", sp.categories.join(", ")],
              ["Service Areas", sp.serviceAreas.map((a) => `${a.suburb} ${a.postcode}`).join("; ")],
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
