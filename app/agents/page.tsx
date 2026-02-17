"use client"

import { useState } from "react"
import Link from "next/link"
import { getApprovedAgents } from "@/lib/storage"
import { shuffle } from "@/lib/shuffle"
import type { AgentProfile, Classification, AgentType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Phone, Info, Building2 } from "lucide-react"


export default function AgentsPage() {
  const [classification, setClassification] = useState<Classification>("residential")
  const [agentType, setAgentType] = useState<AgentType>("selling")
  const [query, setQuery] = useState("")
  const [includeSurrounding, setIncludeSurrounding] = useState(false)
  const [results, setResults] = useState<AgentProfile[] | null>(null)
  const [searched, setSearched] = useState(false)

  function handleSearch() {
    const approved = getApprovedAgents()
    const q = query.trim().toLowerCase()
    let filtered = approved.filter(
      (a) => a.classification === classification && a.agentType === agentType
    )

    if (q) {
      filtered = filtered.filter((a) => {
        const match =
          a.suburb.toLowerCase().includes(q) ||
          a.postcode.includes(q)
        if (includeSurrounding) {
          return match || a.agencyName.toLowerCase().includes(q)
        }
        return match
      })
    }

    setResults(shuffle(filtered))
    setSearched(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Find an Agent</h1>



      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Classification</Label>
          <RadioGroup
            value={classification}
            onValueChange={(v) => setClassification(v as Classification)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="residential" id="ag-res" />
              <Label htmlFor="ag-res">Residential</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="commercial" id="ag-com" />
              <Label htmlFor="ag-com">Commercial</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Agent Type</Label>
          <RadioGroup
            value={agentType}
            onValueChange={(v) => setAgentType(v as AgentType)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="selling" id="sell" />
              <Label htmlFor="sell">Selling agent</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="leasing" id="lease" />
              <Label htmlFor="lease">Leasing agent</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="agent-q">Suburb or Postcode</Label>
          <Input
            id="agent-q"
            placeholder="e.g. Melbourne or 3000"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="ag-surr"
            checked={includeSurrounding}
            onCheckedChange={(v) => setIncludeSurrounding(!!v)}
          />
          <Label htmlFor="ag-surr" className="text-sm">Include surrounding suburbs</Label>
        </div>

        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Results */}
      {searched && results !== null && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "agent" : "agents"} found
          </p>
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
              <User className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No agents found yet.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/register/agent">Register as an agent</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {results.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                      {agent.photo ? (
                        <img src={agent.photo || "/placeholder.svg"} alt={agent.name} className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <h3 className="font-semibold text-foreground">{agent.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {agent.agencyLogo ? (
                          <img src={agent.agencyLogo || "/placeholder.svg"} alt="" className="h-4 w-4 rounded object-cover" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        {agent.agencyName}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="default">
                          <Link href={`/agents/${agent.id}`}>View Profile</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${agent.email}`}>
                            <Mail className="mr-1 h-3 w-3" /> Email
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`tel:${agent.phone}`}>
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
          <User className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Use the search above to find agents.</p>
        </div>
      )}
    </div>
  )
}
