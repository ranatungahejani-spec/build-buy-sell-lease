"use client"

import { useState } from "react"
import Link from "next/link"
import { getApprovedServiceProviders } from "@/lib/storage"
import { SERVICE_CATEGORIES } from "@/types"
import type { ServiceProvider, ServiceCategory } from "@/types"
import { AU_STATES, getSuburbsByState } from "@/lib/au-suburbs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Mail, Phone, Globe } from "lucide-react"

export default function RealEstateServicesPage() {
  const [category, setCategory] = useState<string>("all")
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedSuburb, setSelectedSuburb] = useState<string>("")
  const [includeSurrounding, setIncludeSurrounding] = useState(false)
  const [results, setResults] = useState<ServiceProvider[] | null>(null)
  const [searched, setSearched] = useState(false)

  const suburbsInState = selectedState ? getSuburbsByState(selectedState) : []

  function handleSearch() {
    const approved = getApprovedServiceProviders()
    const q = selectedSuburb ? selectedSuburb.split("|")[0]?.toLowerCase() || selectedSuburb.split("|")[1] || "" : ""

    let filtered = approved
    if (category !== "all") {
      filtered = filtered.filter((s) => s.categories.includes(category as ServiceCategory))
    }
    if (q) {
      filtered = filtered.filter((s) => {
        const areaMatch = s.serviceAreas.some(
          (a) => a.suburb.toLowerCase().includes(q) || a.postcode.includes(q)
        )
        if (includeSurrounding) {
          return areaMatch || s.businessName.toLowerCase().includes(q)
        }
        return areaMatch
      })
    }
    setResults(filtered)
    setSearched(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Real Estate Services</h1>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <Label>All categories</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {SERVICE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-2">
            <Label>State</Label>
            <Select
              value={selectedState || "all"}
              onValueChange={(v) => {
                setSelectedState(v === "all" ? "" : v)
                setSelectedSuburb("")
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {AU_STATES.map((st) => (
                  <SelectItem key={st} value={st}>{st}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Suburb or Postcode</Label>
            <Select
              value={selectedSuburb || "__none__"}
              onValueChange={(v) => setSelectedSuburb(v === "__none__" ? "" : v)}
              disabled={!selectedState}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder="Select suburb" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select suburb</SelectItem>
                {suburbsInState.map((s) => (
                  <SelectItem key={`${s.state}-${s.suburb}-${s.postcode}`} value={`${s.suburb}|${s.postcode}`}>
                    {s.suburb} {s.postcode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="svc-surr" checked={includeSurrounding} onCheckedChange={(v) => setIncludeSurrounding(!!v)} />
          <Label htmlFor="svc-surr" className="text-sm">Include surrounding suburbs</Label>
        </div>

        <Button onClick={handleSearch}>Search</Button>
      </div>

      {searched && results !== null && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{results.length} provider(s) found</p>
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No service providers found yet.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/register/service">Register as a service provider</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {results.map((sp) => (
                <Card key={sp.id}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                      {sp.logo ? (
                        <img src={sp.logo || "/placeholder.svg"} alt={sp.businessName} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <h3 className="font-semibold text-foreground">{sp.businessName}</h3>
                      <p className="text-xs text-muted-foreground">{sp.categories.join(", ")}</p>
                      <p className="text-xs text-muted-foreground">{sp.serviceAreas.map((a) => `${a.suburb} ${a.postcode}`).join("; ")}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="default">
                          <Link href={`/real-estate-services/${sp.id}`}>View Profile</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${sp.email}`}><Mail className="mr-1 h-3 w-3" /> Email</a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`tel:${sp.phone}`}><Phone className="mr-1 h-3 w-3" /> Call</a>
                        </Button>
                        {sp.website && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={sp.website} target="_blank" rel="noopener noreferrer"><Globe className="mr-1 h-3 w-3" /> Web</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Search for real estate service providers above.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/register/service">Register as a service provider</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
