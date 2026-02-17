"use client"

import { useState } from "react"
import Link from "next/link"
import { getApprovedToolProviders } from "@/lib/storage"
import { TOOL_CATEGORIES } from "@/types"
import type { ToolProvider, ToolCategory } from "@/types"
import { AU_STATES, getSuburbsByState } from "@/lib/au-suburbs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Mail, Phone, Globe } from "lucide-react"

export default function RealEstateToolsPage() {
  const [toolType, setToolType] = useState<string>("all")
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedSuburb, setSelectedSuburb] = useState<string>("")
  const [includeSurrounding, setIncludeSurrounding] = useState(false)
  const [results, setResults] = useState<ToolProvider[] | null>(null)
  const [searched, setSearched] = useState(false)

  const suburbsInState = selectedState ? getSuburbsByState(selectedState) : []

  function handleSearch() {
    const approved = getApprovedToolProviders()
    const q = selectedSuburb ? selectedSuburb.split("|")[0]?.toLowerCase() || selectedSuburb.split("|")[1] || "" : ""

    let filtered = approved
    if (toolType !== "all") {
      filtered = filtered.filter((t) => t.toolCategory === toolType)
    }
    if (q) {
      filtered = filtered.filter((t) => {
        const areaMatch = t.coverageAreas.some(
          (a) => a.suburb.toLowerCase().includes(q) || a.postcode.includes(q)
        )
        if (includeSurrounding) {
          return areaMatch || t.businessName.toLowerCase().includes(q)
        }
        return areaMatch
      })
    }
    setResults(filtered)
    setSearched(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Real Estate Tools</h1>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <Label>All categories</Label>
          <Select value={toolType} onValueChange={setToolType}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {TOOL_CATEGORIES.map((cat) => (
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
          <Checkbox id="tool-surr" checked={includeSurrounding} onCheckedChange={(v) => setIncludeSurrounding(!!v)} />
          <Label htmlFor="tool-surr" className="text-sm">Include surrounding suburbs</Label>
        </div>

        <Button onClick={handleSearch}>Search</Button>
      </div>

      {searched && results !== null && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{results.length} provider(s) found</p>
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
              <Wrench className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No tool providers found yet.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/register/tool">Register as a tool provider</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {results.map((tp) => (
                <Card key={tp.id}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                      {tp.logo ? (
                        <img src={tp.logo || "/placeholder.svg"} alt={tp.businessName} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <Wrench className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <h3 className="font-semibold text-foreground">{tp.businessName}</h3>
                      <p className="text-xs text-muted-foreground">{tp.toolCategory}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="default">
                          <Link href={`/real-estate-tools/${tp.id}`}>View Profile</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${tp.email}`}><Mail className="mr-1 h-3 w-3" /> Email</a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`tel:${tp.phone}`}><Phone className="mr-1 h-3 w-3" /> Call</a>
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
          <Wrench className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Search for real estate tool providers above.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/register/tool">Register as a tool provider</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
