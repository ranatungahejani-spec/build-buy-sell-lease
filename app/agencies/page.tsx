"use client"

import { useState } from "react"
import Link from "next/link"
import { getApprovedAgencies } from "@/lib/storage"
import { shuffle } from "@/lib/shuffle"
import type { AgencyProfile, Classification } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Mail, Phone, Info } from "lucide-react"

export default function AgenciesPage() {
  const [classification, setClassification] = useState<Classification>("residential")
  const [query, setQuery] = useState("")
  const [includeSurrounding, setIncludeSurrounding] = useState(false)
  const [results, setResults] = useState<AgencyProfile[] | null>(null)
  const [searched, setSearched] = useState(false)

  function handleSearch() {
    const approved = getApprovedAgencies()
    const q = query.trim().toLowerCase()
    let filtered = approved.filter((a) => a.classification === classification)

    if (q) {
      filtered = filtered.filter((a) => {
        const match =
          a.suburb.toLowerCase().includes(q) ||
          a.postcode.includes(q)
        if (includeSurrounding) {
          return match || a.name.toLowerCase().includes(q)
        }
        return match
      })
    }

    setResults(shuffle(filtered))
    setSearched(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Find an Agency</h1>


      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Classification</Label>
          <RadioGroup
            value={classification}
            onValueChange={(v) => setClassification(v as Classification)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="residential" id="res" />
              <Label htmlFor="res">Residential</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="commercial" id="com" />
              <Label htmlFor="com">Commercial</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="agency-q">Suburb or Postcode</Label>
          <Input
            id="agency-q"
            placeholder="e.g. Sydney or 2000"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="surr"
            checked={includeSurrounding}
            onCheckedChange={(v) => setIncludeSurrounding(!!v)}
          />
          <Label htmlFor="surr" className="text-sm">Include surrounding suburbs</Label>
        </div>

        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Results */}
      {searched && results !== null && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "agency" : "agencies"} found
          </p>
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No agencies found yet.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/register/agency">Register your agency</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {results.map((agency) => (
                <Card key={agency.id}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                      {agency.logo ? (
                        <img src={agency.logo || "/placeholder.svg"} alt={agency.name} className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <h3 className="font-semibold text-foreground">{agency.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {agency.suburb}, {agency.postcode}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button asChild size="sm" variant="default">
                          <Link href={`/agencies/${agency.id}`}>View Profile</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${agency.email}`}>
                            <Mail className="mr-1 h-3 w-3" /> Email
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`tel:${agency.phone}`}>
                            <Phone className="mr-1 h-3 w-3" /> Call
                          </a>
                        </Button>
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
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Use the search above to find agencies.</p>
        </div>
      )}
    </div>
  )
}
