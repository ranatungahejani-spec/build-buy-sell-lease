"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { getAgentById, updateAgent } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function AgentDashboardPage() {
  const session = useAuthStore((s) => s.session)
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    if (!session || session.role !== "agent") {
      router.replace("/auth/portal-sign-in")
    }
  }, [session, router])

  if (!session || session.role !== "agent") return null

  const agent = getAgentById(session.userId)
  if (!agent) return <p className="text-muted-foreground">Profile not found.</p>

  function handleSave() {
    updateAgent(agent!.id, { phone, name })
    toast.success("Profile updated")
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Agent Dashboard</h1>
        <Badge variant={agent.status === "approved" ? "default" : "secondary"} className="capitalize">
          {agent.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3">
            {[
              ["Name", agent.name],
              ["Agency", agent.agencyName],
              ["Classification", agent.classification],
              ["Type", agent.agentType],
              ["Email", agent.email],
              ["Phone", agent.phone],
              ["Suburb", agent.suburb],
              ["Postcode", agent.postcode],
              ["Properties Sold", String(agent.propertiesSold)],
              ["Listings", String(agent.numberOfListings)],
              ["Avg Sold Price", `$${agent.averageSoldPrice.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                <dd className="text-sm capitalize text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          {editing ? (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setName(agent.name)
                setPhone(agent.phone)
                setEditing(true)
              }}
            >
              Edit Details
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
