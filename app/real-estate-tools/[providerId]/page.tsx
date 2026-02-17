"use client"

import { use } from "react"
import { getToolProviderById } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wrench, Mail, Phone, Globe, MapPin } from "lucide-react"

export default function ToolProviderDetailPage({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = use(params)
  const tp = getToolProviderById(providerId)

  if (!tp || tp.status !== "approved") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Wrench className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Tool provider not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
          {tp.logo ? (
            <img src={tp.logo || "/placeholder.svg"} alt={tp.businessName} className="h-14 w-14 rounded object-cover" />
          ) : (
            <Wrench className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tp.businessName}</h1>
          <Badge variant="secondary" className="mt-1">{tp.toolCategory}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>{tp.businessAddress}</p>
            <p><span className="font-medium">Contact:</span> {tp.contactPerson}</p>
            <a href={`tel:${tp.phone}`} className="flex items-center gap-1 hover:underline"><Phone className="h-3 w-3" /> {tp.phone}</a>
            <a href={`mailto:${tp.email}`} className="flex items-center gap-1 hover:underline"><Mail className="h-3 w-3" /> {tp.email}</a>
            {tp.website && (
              <a href={tp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline"><Globe className="h-3 w-3" /> {tp.website}</a>
            )}
            <div className="mt-2 flex gap-2">
              <Button size="sm" asChild><a href={`mailto:${tp.email}`}><Mail className="mr-1 h-3 w-3" /> Email</a></Button>
              <Button size="sm" variant="outline" asChild><a href={`tel:${tp.phone}`}><Phone className="mr-1 h-3 w-3" /> Call</a></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Coverage Areas</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {tp.coverageAreas.map((a, i) => (
                <Badge key={i} variant="outline">
                  <MapPin className="mr-1 h-3 w-3" /> {a.suburb} {a.postcode}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
