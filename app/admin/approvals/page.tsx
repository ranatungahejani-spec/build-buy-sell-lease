"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import {
  getAgencies, updateAgencyStatus,
  getAgents, updateAgentStatus,
  getServiceProviders, updateServiceProviderStatus,
  getToolProviders, updateToolProviderStatus,
} from "@/lib/storage"
import type { ProfileStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

function StatusBadge({ status }: { status: ProfileStatus }) {
  const variant = status === "approved"
    ? "default"
    : status === "pending"
      ? "secondary"
      : "destructive"
  return <Badge variant={variant} className="capitalize">{status}</Badge>
}

function ActionButtons({ id, status, onAction }: { id: string; status: ProfileStatus; onAction: (id: string, s: ProfileStatus) => void }) {
  return (
    <div className="flex gap-2">
      {status !== "approved" && (
        <Button size="sm" onClick={() => onAction(id, "approved")}>Approve</Button>
      )}
      {status !== "rejected" && (
        <Button size="sm" variant="outline" onClick={() => onAction(id, "rejected")}>Reject</Button>
      )}
      {status !== "suspended" && status === "approved" && (
        <Button size="sm" variant="destructive" onClick={() => onAction(id, "suspended")}>Suspend</Button>
      )}
    </div>
  )
}

export default function AdminApprovalsPage() {
  const session = useAuthStore((s) => s.session)
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!session || !session.email.endsWith("@admin.local")) {
      router.replace("/auth/consumer-sign-in")
    }
  }, [session, router])

  if (!session || !session.email.endsWith("@admin.local")) return null

  const agencies = getAgencies()
  const agents = getAgents()
  const services = getServiceProviders()
  const tools = getToolProviders()

  function handleAgencyAction(id: string, status: ProfileStatus) {
    updateAgencyStatus(id, status)
    toast.success(`Agency ${status}`)
    setRefreshKey((k) => k + 1)
  }

  function handleAgentAction(id: string, status: ProfileStatus) {
    updateAgentStatus(id, status)
    toast.success(`Agent ${status}`)
    setRefreshKey((k) => k + 1)
  }

  function handleServiceAction(id: string, status: ProfileStatus) {
    updateServiceProviderStatus(id, status)
    toast.success(`Service provider ${status}`)
    setRefreshKey((k) => k + 1)
  }

  function handleToolAction(id: string, status: ProfileStatus) {
    updateToolProviderStatus(id, status)
    toast.success(`Tool provider ${status}`)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col gap-6" key={refreshKey}>
      <h1 className="text-2xl font-bold text-foreground">Admin Approvals</h1>

      <Tabs defaultValue="agencies">
        <TabsList>
          <TabsTrigger value="agencies">Agencies ({agencies.length})</TabsTrigger>
          <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
          <TabsTrigger value="tools">Tools ({tools.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="agencies" className="mt-4">
          {agencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agency registrations yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {agencies.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-foreground">{a.name}</p>
                      <p className="text-sm text-muted-foreground">{a.email} &middot; {a.suburb} {a.postcode}</p>
                      <StatusBadge status={a.status} />
                    </div>
                    <ActionButtons id={a.id} status={a.status} onAction={handleAgencyAction} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          {agents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agent registrations yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {agents.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-foreground">{a.name}</p>
                      <p className="text-sm text-muted-foreground">{a.email} &middot; {a.agencyName}</p>
                      <StatusBadge status={a.status} />
                    </div>
                    <ActionButtons id={a.id} status={a.status} onAction={handleAgentAction} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">No service provider registrations yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {services.map((s) => (
                <Card key={s.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-foreground">{s.businessName}</p>
                      <p className="text-sm text-muted-foreground">{s.email} &middot; {s.categories.join(", ")}</p>
                      <StatusBadge status={s.status} />
                    </div>
                    <ActionButtons id={s.id} status={s.status} onAction={handleServiceAction} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          {tools.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tool provider registrations yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {tools.map((t) => (
                <Card key={t.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-foreground">{t.businessName}</p>
                      <p className="text-sm text-muted-foreground">{t.email} &middot; {t.toolCategory}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <ActionButtons id={t.id} status={t.status} onAction={handleToolAction} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
