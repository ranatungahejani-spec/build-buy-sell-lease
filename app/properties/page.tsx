"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Search, SlidersHorizontal } from "lucide-react";

// ✅ If you have shadcn installed, keep these imports.
// If your paths differ, adjust accordingly.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AU_STATES, AU_SUBURBS, getSuburbsByState } from "@/lib/au-suburbs";

// --------------------
// Types
// --------------------
type Segment = "residential" | "commercial";
type Intent = "buy" | "lease" | "sold" | "leased";

type Address = {
  unit?: string;
  street?: string;
  suburb: string;
  state?: string;
  postcode: string;
};

type Property = {
  propertyId: string;
  address: Address;
  segment: Segment;
  intent: Intent;
  propertyType: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  carSpaces?: number;
  features: string[];
  description?: string;
  mediaUrls: string[];
  published: boolean;
  createdAt: string;
};

type PropertyFilters = {
  queryText: string;
  includeSurrounding: boolean;
  radiusKm: number;

  segment: Segment | "any";
  intent: Intent | "any";

  propertyType: string | "Any";

  priceMin: string; // keep as string for inputs
  priceMax: string;
  onlyWithPrice: boolean;

  bedrooms: string; // "Any" | "1" | "2" etc
  bathrooms: string;
  carSpaces: string;

  keyword: string;
  featureKeywords: string[]; // selected features
};

// --------------------
// Local storage repo (NO sample data)
// --------------------
const LS_PROPERTIES = "bsl:properties";

function loadProperties(): Property[] {
  try {
    const raw = localStorage.getItem(LS_PROPERTIES);
    if (!raw) return []; // ✅ empty by default
    const parsed = JSON.parse(raw) as Property[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// --------------------
// Surrounding suburb helpers (small dataset; not sample listings)
// --------------------
type SuburbGeo = { suburb: string; postcode: string; state: string; lat: number; lng: number };

const AU_SUBURBS_GEO: SuburbGeo[] = [
  { suburb: "Sydney", postcode: "2000", state: "NSW", lat: -33.8688, lng: 151.2093 },
  { suburb: "Parramatta", postcode: "2150", state: "NSW", lat: -33.815, lng: 151.0011 },
  { suburb: "Chatswood", postcode: "2067", state: "NSW", lat: -33.7969, lng: 151.182 },

  { suburb: "Melbourne", postcode: "3000", state: "VIC", lat: -37.8136, lng: 144.9631 },
  { suburb: "Richmond", postcode: "3121", state: "VIC", lat: -37.8183, lng: 145.0018 },
  { suburb: "St Kilda", postcode: "3182", state: "VIC", lat: -37.8676, lng: 144.9809 },

  { suburb: "Brisbane City", postcode: "4000", state: "QLD", lat: -27.4698, lng: 153.0251 },
  { suburb: "Fortitude Valley", postcode: "4006", state: "QLD", lat: -27.457, lng: 153.033 },

  { suburb: "Perth", postcode: "6000", state: "WA", lat: -31.9523, lng: 115.8613 },
  { suburb: "Fremantle", postcode: "6160", state: "WA", lat: -32.0569, lng: 115.7439 },

  { suburb: "Adelaide", postcode: "5000", state: "SA", lat: -34.9285, lng: 138.6007 },
  { suburb: "Hobart", postcode: "7000", state: "TAS", lat: -42.8821, lng: 147.3272 },
  { suburb: "Canberra", postcode: "2600", state: "ACT", lat: -35.2809, lng: 149.13 },
  { suburb: "Darwin", postcode: "0800", state: "NT", lat: -12.4634, lng: 130.8456 },
];

function toRad(n: number) {
  return (n * Math.PI) / 180;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

/**
 * Expands a suburb/postcode query to nearby suburb names (within radius).
 * If query not found in dataset, it falls back to the raw query only.
 */
function expandSurroundingSuburbs(queryText: string, radiusKm: number): string[] {
  const q = queryText.trim().toLowerCase();
  if (!q) return [];

  const anchor =
    AU_SUBURBS_GEO.find((s) => s.suburb.toLowerCase() === q) ||
    AU_SUBURBS_GEO.find((s) => s.postcode === queryText.trim());

  if (!anchor) return [queryText.trim()];

  const nearby = AU_SUBURBS_GEO.filter((s) => haversineKm(anchor, s) <= radiusKm).map((s) => s.suburb);
  // Always include the anchor suburb name as well
  return Array.from(new Set([anchor.suburb, ...nearby]));
}

// --------------------
// Filtering functions
// --------------------
function normalize(str: string) {
  return str.trim().toLowerCase();
}

function parseNum(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function matchQuery(property: Property, queryText: string, includeSurrounding: boolean, radiusKm: number) {
  const q = queryText.trim();
  if (!q) return true;

  // If include surrounding suburbs: expand suburb list from geo dataset
  if (includeSurrounding) {
    const suburbs = expandSurroundingSuburbs(q, radiusKm).map((s) => normalize(s));
    const propSuburb = normalize(property.address.suburb);
    const propPostcode = property.address.postcode.trim();
    return suburbs.includes(propSuburb) || propPostcode === q;
  }

  // Otherwise: direct match (suburb contains OR postcode equals OR address text contains)
  const propSuburb = normalize(property.address.suburb);
  const propPostcode = property.address.postcode.trim();
  const addressText = normalize(
    `${property.address.unit ?? ""} ${property.address.street ?? ""} ${property.address.suburb} ${property.address.postcode} ${property.address.state ?? ""}`
  );

  return propSuburb.includes(normalize(q)) || propPostcode === q || addressText.includes(normalize(q));
}

function matchKeyword(property: Property, keyword: string) {
  const k = normalize(keyword);
  if (!k) return true;

  const haystack = normalize(
    [
      property.propertyType,
      property.description ?? "",
      property.address.suburb,
      property.address.postcode,
      property.address.state ?? "",
      ...(property.features ?? []),
    ].join(" ")
  );

  return haystack.includes(k);
}

function matchFeatures(property: Property, selected: string[]) {
  if (!selected.length) return true;
  const features = new Set((property.features ?? []).map(normalize));
  return selected.every((f) => features.has(normalize(f)));
}

function filterProperties(all: Property[], f: PropertyFilters): Property[] {
  const min = parseNum(f.priceMin);
  const max = parseNum(f.priceMax);

  const bed = f.bedrooms === "Any" ? undefined : parseNum(f.bedrooms);
  const bath = f.bathrooms === "Any" ? undefined : parseNum(f.bathrooms);
  const car = f.carSpaces === "Any" ? undefined : parseNum(f.carSpaces);

  return all
    .filter((p) => p.published) // ✅ only published listings show
    .filter((p) => (f.segment === "any" ? true : p.segment === f.segment))
    .filter((p) => (f.intent === "any" ? true : p.intent === f.intent))
    .filter((p) => (f.propertyType === "Any" ? true : p.propertyType === f.propertyType))
    .filter((p) => matchQuery(p, f.queryText, f.includeSurrounding, f.radiusKm))
    .filter((p) => {
      if (f.onlyWithPrice) return typeof p.price === "number";
      return true;
    })
    .filter((p) => {
      if (min !== undefined && typeof p.price === "number" && p.price < min) return false;
      if (max !== undefined && typeof p.price === "number" && p.price > max) return false;
      // If price is missing and user set min/max, we keep it unless onlyWithPrice is on
      return true;
    })
    .filter((p) => (bed === undefined ? true : (p.bedrooms ?? 0) >= bed))
    .filter((p) => (bath === undefined ? true : (p.bathrooms ?? 0) >= bath))
    .filter((p) => (car === undefined ? true : (p.carSpaces ?? 0) >= car))
    .filter((p) => matchKeyword(p, f.keyword))
    .filter((p) => matchFeatures(p, f.featureKeywords));
}

// --------------------
// Page
// --------------------
const FEATURE_OPTIONS = ["Pool", "Garage", "Air conditioning", "Garden", "Balcony", "Pets allowed", "Accessible"];
const PROPERTY_TYPES_RES = ["Any", "House", "Townhouse", "Apartment & Unit", "Villa", "Retirement Living", "Land", "Acreage", "Rural"];
const PROPERTY_TYPES_COM = ["Any", "Office", "Retail", "Industrial", "Land", "Other"];

export default function PropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedSuburb, setSelectedSuburb] = useState<string>("");
  const [filters, setFilters] = useState<PropertyFilters>({
    queryText: "",
    includeSurrounding: false,
    radiusKm: 10,

    segment: "any",
    intent: "any",

    propertyType: "Any",

    priceMin: "",
    priceMax: "",
    onlyWithPrice: false,

    bedrooms: "Any",
    bathrooms: "Any",
    carSpaces: "Any",

    keyword: "",
    featureKeywords: [],
  });

  const suburbsInState = selectedState ? getSuburbsByState(selectedState) : AU_SUBURBS;

  function applySuburbSelection(suburb: string, postcode: string) {
    setSelectedSuburb(`${suburb}|${postcode}`);
    setFilters((p) => ({ ...p, queryText: suburb || postcode }));
  }

  // Load from localStorage (empty by default, no sample data)
  useEffect(() => {
    setAllProperties(loadProperties());
  }, []);

  const filtered = useMemo(() => filterProperties(allProperties, filters), [allProperties, filters]);

  const propertyTypes =
    filters.segment === "commercial" ? PROPERTY_TYPES_COM : PROPERTY_TYPES_RES;

  function toggleFeature(name: string) {
    setFilters((prev) => {
      const exists = prev.featureKeywords.includes(name);
      return {
        ...prev,
        featureKeywords: exists
          ? prev.featureKeywords.filter((x) => x !== name)
          : [...prev.featureKeywords, name],
      };
    });
  }

  function clearAll() {
    setSelectedState("");
    setSelectedSuburb("");
    setFilters({
      queryText: "",
      includeSurrounding: false,
      radiusKm: 10,

      segment: "any",
      intent: "any",

      propertyType: "Any",

      priceMin: "",
      priceMax: "",
      onlyWithPrice: false,

      bedrooms: "Any",
      bathrooms: "Any",
      carSpaces: "Any",

      keyword: "",
      featureKeywords: [],
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Properties</h1>
        <p className="text-muted-foreground">
          Search published listings. (No sample data — listings appear only after agents/agencies publish.)
        </p>
      </div>

      {/* Search + filter panel */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4">
          {/* top row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex flex-1 flex-wrap items-end gap-2">
              <div className="min-w-[100px]">
                <Label>State</Label>
                <Select
                  value={selectedState || "all"}
                  onValueChange={(v) => {
                    setSelectedState(v === "all" ? "" : v);
                    setSelectedSuburb("");
                    if (!v || v === "all") setFilters((p) => ({ ...p, queryText: "" }));
                  }}
                >
                  <SelectTrigger className="mt-1">
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
              <div className="min-w-[160px]">
                <Label>Suburb or Postcode</Label>
                <Select
                  value={selectedSuburb || "__none__"}
                  onValueChange={(v) => {
                    if (v === "__none__") {
                      setSelectedSuburb("");
                      setFilters((p) => ({ ...p, queryText: "" }));
                      return;
                    }
                    setSelectedSuburb(v);
                    const [suburb, postcode] = v.split("|");
                    setFilters((p) => ({ ...p, queryText: suburb || postcode }));
                  }}
                >
                  <SelectTrigger className="mt-1">
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
              <Button type="button" variant="secondary" onClick={() => setShowFilters((s) => !s)}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.includeSurrounding}
                  onCheckedChange={(v) => setFilters((p) => ({ ...p, includeSurrounding: v }))}
                />
                <Label>Include surrounding suburbs</Label>
              </div>

              <div className="w-[110px]">
                <Label>Radius (km)</Label>
                <Input
                  inputMode="numeric"
                  value={String(filters.radiusKm)}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, radiusKm: Math.max(1, Number(e.target.value || 10)) }))
                  }
                  disabled={!filters.includeSurrounding}
                />
              </div>

              <Button type="button" onClick={() => { /* no-op: filtering is reactive */ }}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          {showFilters && (
            <>
              <Separator />

              {/* segment + intent */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <Label>Segment</Label>
                  <Select
                    value={filters.segment}
                    onValueChange={(v) =>
                      setFilters((p) => ({
                        ...p,
                        segment: v as PropertyFilters["segment"],
                        propertyType: "Any", // reset types when segment changes
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Intent</Label>
                  <Select
                    value={filters.intent}
                    onValueChange={(v) => setFilters((p) => ({ ...p, intent: v as PropertyFilters["intent"] }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="lease">Lease</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="leased">Leased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Property type</Label>
                  <Select
                    value={filters.propertyType}
                    onValueChange={(v) => setFilters((p) => ({ ...p, propertyType: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Keyword</Label>
                  <Input
                    className="mt-1"
                    placeholder="e.g. pool, renovated, balcony"
                    value={filters.keyword}
                    onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))}
                  />
                </div>
              </div>

              {/* price + stats */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <Label>Price min</Label>
                  <Input
                    className="mt-1"
                    inputMode="numeric"
                    placeholder="e.g. 500000"
                    value={filters.priceMin}
                    onChange={(e) => setFilters((p) => ({ ...p, priceMin: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Price max</Label>
                  <Input
                    className="mt-1"
                    inputMode="numeric"
                    placeholder="e.g. 900000"
                    value={filters.priceMax}
                    onChange={(e) => setFilters((p) => ({ ...p, priceMax: e.target.value }))}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Checkbox
                    checked={filters.onlyWithPrice}
                    onCheckedChange={(v) => setFilters((p) => ({ ...p, onlyWithPrice: Boolean(v) }))}
                    id="onlyWithPrice"
                  />
                  <Label htmlFor="onlyWithPrice">Only show properties with a price</Label>
                </div>
                <div>
                  <Label>Bedrooms / Bathrooms / Car spaces</Label>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    <Select value={filters.bedrooms} onValueChange={(v) => setFilters((p) => ({ ...p, bedrooms: v }))}>
                      <SelectTrigger><SelectValue placeholder="Beds" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        {["1", "2", "3", "4", "5"].map((n) => <SelectItem key={n} value={n}>{n}+</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.bathrooms} onValueChange={(v) => setFilters((p) => ({ ...p, bathrooms: v }))}>
                      <SelectTrigger><SelectValue placeholder="Baths" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        {["1", "2", "3", "4"].map((n) => <SelectItem key={n} value={n}>{n}+</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filters.carSpaces} onValueChange={(v) => setFilters((p) => ({ ...p, carSpaces: v }))}>
                      <SelectTrigger><SelectValue placeholder="Cars" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        {["0", "1", "2", "3"].map((n) => <SelectItem key={n} value={n}>{n}+</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* features */}
              <div className="flex flex-col gap-2">
                <Label>Features</Label>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_OPTIONS.map((f) => {
                    const active = filters.featureKeywords.includes(f);
                    return (
                      <Button
                        key={f}
                        type="button"
                        variant={active ? "default" : "secondary"}
                        size="sm"
                        onClick={() => toggleFeature(f)}
                      >
                        {f}
                      </Button>
                    );
                  })}
                </div>

                {filters.featureKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.featureKeywords.map((f) => (
                      <Badge key={f} variant="outline">
                        {f}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={clearAll}>
                  Clear all
                </Button>
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filtered.length}</span> results
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No results</h2>
          <p className="max-w-md text-muted-foreground">
            There are no published listings matching your filters yet.
          </p>
          <p className="max-w-md text-muted-foreground">
            Property listings will appear here once agencies and agents publish them.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((p) => (
            <Card key={p.propertyId} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {p.address.suburb} {p.address.postcode}
                  </div>
                  <div className="text-lg font-semibold">
                    {p.propertyType} • {p.segment} • {p.intent}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {typeof p.price === "number" ? `Price: $${p.price.toLocaleString()}` : "Price: Not provided"}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {typeof p.bedrooms === "number" && <Badge variant="secondary">{p.bedrooms} bd</Badge>}
                    {typeof p.bathrooms === "number" && <Badge variant="secondary">{p.bathrooms} ba</Badge>}
                    {typeof p.carSpaces === "number" && <Badge variant="secondary">{p.carSpaces} car</Badge>}
                  </div>

                  {p.features?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.features.slice(0, 5).map((f) => (
                        <Badge key={f} variant="outline">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Placeholder buttons (wire to your auth + saved system later) */}
                <div className="flex flex-col gap-2">
                  <Button size="sm">View</Button>
                  <Button size="sm" variant="secondary">Save</Button>
                  <Button size="sm" variant="ghost">Share</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
