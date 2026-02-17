"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { getAgencyById, updateAgency } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function AgencyDashboardPage() {
  const session = useAuthStore((s) => s.session)
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState("")
  const [streetAddress, setStreetAddress] = useState("")

  useEffect(() => {
    if (!session || session.role !== "agency") {
      router.replace("/auth/portal-sign-in")
    }
  }, [session, router])

  if (!session || session.role !== "agency") return null

  const agency = getAgencyById(session.userId)
  if (!agency) return <p className="text-muted-foreground">Profile not found.</p>

  function handleSave() {
    updateAgency(agency!.id, { phone, streetAddress })
    toast.success("Profile updated")
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Agency Dashboard</h1>
        <Badge variant={agency.status === "approved" ? "default" : "secondary"} className="capitalize">
          {agency.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3">
            {[
              ["Name", agency.name],
              ["Classification", agency.classification],
              ["Email", agency.email],
              ["Suburb", agency.suburb],
              ["Postcode", agency.postcode],
              ["CRM", agency.crm],
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
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Street Address</Label>
                <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
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
                setPhone(agency.phone)
                setStreetAddress(agency.streetAddress)
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
