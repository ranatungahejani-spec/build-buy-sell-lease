"use client"

import { use } from "react"
import { getServiceProviderById } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, Mail, Phone, Globe, MapPin } from "lucide-react"

export default function ServiceProviderDetailPage({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = use(params)
  const sp = getServiceProviderById(providerId)

  if (!sp || sp.status !== "approved") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Briefcase className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Service provider not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
          {sp.logo ? (
            <img src={sp.logo || "/placeholder.svg"} alt={sp.businessName} className="h-14 w-14 rounded object-cover" />
          ) : (
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{sp.businessName}</h1>
          <div className="mt-1 flex flex-wrap gap-1">
            {sp.categories.map((c) => (
              <Badge key={c} variant="secondary">{c}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>{sp.address}</p>
            <a href={`tel:${sp.phone}`} className="flex items-center gap-1 hover:underline"><Phone className="h-3 w-3" /> {sp.phone}</a>
            <a href={`mailto:${sp.email}`} className="flex items-center gap-1 hover:underline"><Mail className="h-3 w-3" /> {sp.email}</a>
            {sp.website && (
              <a href={sp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline"><Globe className="h-3 w-3" /> {sp.website}</a>
            )}
            <div className="mt-2 flex gap-2">
              <Button size="sm" asChild><a href={`mailto:${sp.email}`}><Mail className="mr-1 h-3 w-3" /> Email</a></Button>
              <Button size="sm" variant="outline" asChild><a href={`tel:${sp.phone}`}><Phone className="mr-1 h-3 w-3" /> Call</a></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {sp.qualifications && <p><span className="font-medium">Qualifications:</span> {sp.qualifications}</p>}
            {sp.availability && <p><span className="font-medium">Availability:</span> {sp.availability}</p>}
            <div>
              <span className="font-medium">Service Areas:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {sp.serviceAreas.map((a, i) => (
                  <Badge key={i} variant="outline">
                    <MapPin className="mr-1 h-3 w-3" /> {a.suburb} {a.postcode}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
