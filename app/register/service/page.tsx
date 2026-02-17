"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createServiceProvider } from "@/lib/storage"
import { SERVICE_CATEGORIES } from "@/types"
import type { ServiceCategory, ServiceAreaWithRadius, ServiceAreaRadius } from "@/types"
import { AU_STATES, getSuburbsByState } from "@/lib/au-suburbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Plus, X } from "lucide-react"

const RADIUS_OPTIONS: { value: ServiceAreaRadius; label: string }[] = [
  { value: 5, label: "5 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
]

const schema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  principalName: z.string().min(1, "Principal name is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  suburb: z.string().min(1, "Suburb is required"),
  state: z.string().min(1, "State is required"),
  postcode: z.string().min(4, "Postcode is required").max(4),
  phone: z.string().min(8, "Phone is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(9, "Min 9 characters"),
  website: z.string().optional(),
  aboutUs: z.string().min(1, "About Us is required (up to 200 words)").max(1400, "About Us must be 200 words or less (approx. 1400 characters)"),
})

type FormValues = z.infer<typeof schema>

export default function ServiceRegistrationPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([])
  const [areas, setAreas] = useState<ServiceAreaWithRadius[]>([])
  const [areaState, setAreaState] = useState("")
  const [areaSuburb, setAreaSuburb] = useState("")
  const [areaRadius, setAreaRadius] = useState<ServiceAreaRadius>(25)
  const [logoPreview, setLogoPreview] = useState("")
  const [catError, setCatError] = useState("")
  const [areaError, setAreaError] = useState("")

  const suburbsInState = areaState ? getSuburbsByState(areaState) : []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: "",
      principalName: "",
      streetAddress: "",
      suburb: "",
      state: "",
      postcode: "",
      phone: "",
      email: "",
      password: "",
      website: "",
      aboutUs: "",
    },
  })


  function toggleCategory(cat: ServiceCategory) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
    setCatError("")
  }

  function addArea() {
    if (!areaState || !areaSuburb) {
      setAreaError("Select state and suburb")
      return
    }
    const [suburb, postcode] = areaSuburb.split("|")
    const existing = areas.some((a) => a.suburb === suburb && a.postcode === postcode && a.radiusKm === areaRadius)
    if (existing) {
      setAreaError("This area and radius is already added")
      return
    }
    setAreas((prev) => [...prev, { suburb, postcode, state: areaState, radiusKm: areaRadius }])
    setAreaError("")
  }

  function removeArea(i: number) {
    setAreas((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function onSubmit(data: FormValues) {
    if (selectedCategories.length === 0) {
      setCatError("Select at least one category")
      return
    }
    if (areas.length === 0) {
      setAreaError("Add at least one area with radius")
      return
    }

    const sp = createServiceProvider({
      businessName: data.businessName,
      principalName: data.principalName,
      streetAddress: data.streetAddress,
      suburb: data.suburb,
      state: data.state,
      postcode: data.postcode,
      phone: data.phone,
      email: data.email,
      password: data.password,
      website: data.website ?? "",
      categories: selectedCategories,
      serviceAreas: areas,
      logo: logoPreview,
      aboutUs: data.aboutUs,
    })
    setSubmittedId(sp.serviceId)
    setSubmitted(true)
    // Stub: redirect to payment gateway
    // router.push("/payment?type=service&id=" + sp.id)
  }

  if (submitted) {
    return (
      <div className="flex justify-center py-8">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <h2 className="text-xl font-bold text-foreground">Thank you for joining</h2>
            <p className="text-sm text-muted-foreground">
              Your service provider profile has been submitted. You will receive a confirmation email shortly.
            </p>
            {submittedId && (
              <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
                Your Service ID: <strong>{submittedId}</strong>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Payment gateway is not set up yet. You will be directed to complete payment when ready.
            </p>
            <Button variant="outline" onClick={() => router.push("/real-estate-services")}>
              Back to Real Estate Services
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Register as a Search provider</CardTitle>
          <CardDescription>List your real estate services. You can be found by suburb and/or postcode.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-principal">Principal Name (Name of owner of business) *</Label>
              <Input id="sp-principal" {...register("principalName")} />
              {errors.principalName && <p className="text-sm text-destructive">{errors.principalName.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-bn">Business Name *</Label>
              <Input id="sp-bn" {...register("businessName")} />
              {errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Address *</Label>
              <div className="flex flex-col gap-2">
                <Input placeholder="Street address" {...register("streetAddress")} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Suburb" {...register("suburb")} />
                  <Select value={watch("state") || "__"} onValueChange={(v) => setValue("state", v === "__" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__">State</SelectItem>
                      {AU_STATES.map((st) => (
                        <SelectItem key={st} value={st}>{st}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Postcode" maxLength={4} {...register("postcode")} className="w-24" />
                </div>
              </div>
              {errors.streetAddress && <p className="text-sm text-destructive">{errors.streetAddress.message}</p>}
              {errors.suburb && <p className="text-sm text-destructive">{errors.suburb.message}</p>}
              {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
              {errors.postcode && <p className="text-sm text-destructive">{errors.postcode.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sp-ph">Phone *</Label>
                <Input id="sp-ph" type="tel" {...register("phone")} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sp-em">Email *</Label>
                <Input id="sp-em" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-pw">Password *</Label>
              <Input id="sp-pw" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-web">Website</Label>
              <Input
                id="sp-web"
                type="url"
                placeholder="e.g. www.yourbusiness.com.au/maroubra"
                {...register("website")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Categories * (from list only)</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SERVICE_CATEGORIES.map((cat) => (
                  <div key={cat} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <Label htmlFor={`cat-${cat}`} className="text-sm font-normal">{cat}</Label>
                  </div>
                ))}
              </div>
              {catError && <p className="text-sm text-destructive">{catError}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Add Area (radius so you appear in search outside your postcode/suburb) *</Label>
              <div className="flex flex-wrap items-end gap-2">
                <Select value={areaState || "__"} onValueChange={(v) => { setAreaState(v === "__" ? "" : v); setAreaSuburb(""); }}>
                  <SelectTrigger className="w-[90px]"><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__">State</SelectItem>
                    {AU_STATES.map((st) => (
                      <SelectItem key={st} value={st}>{st}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={areaSuburb || "__"}
                  onValueChange={(v) => setAreaSuburb(v === "__" ? "" : v)}
                  disabled={!areaState}
                >
                  <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Suburb" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__">Suburb</SelectItem>
                    {suburbsInState.map((s) => (
                      <SelectItem key={`${s.suburb}-${s.postcode}`} value={`${s.suburb}|${s.postcode}`}>
                        {s.suburb} {s.postcode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  {RADIUS_OPTIONS.map((r) => (
                    <Label key={r.value} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={areaRadius === r.value}
                        onCheckedChange={() => setAreaRadius(r.value)}
                      />
                      {r.label}
                    </Label>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addArea}>
                  <Plus className="mr-1 h-3 w-3" /> Add Area
                </Button>
              </div>
              {areas.length > 0 && (
                <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {areas.map((a, i) => (
                    <li key={i} className="flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1">
                      {a.suburb} {a.postcode} ({a.radiusKm}km)
                      <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeArea(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {areaError && <p className="text-sm text-destructive">{areaError}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Logo (e.g. JPEG accepted)</Label>
              <Input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleLogo} />
              {logoPreview && <img src={logoPreview} alt="Preview" className="h-12 w-12 rounded object-cover" />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sp-about">About Us * (200 word description)</Label>
              <Textarea id="sp-about" rows={5} maxLength={1400} placeholder="Describe your business (max 200 words)..." {...register("aboutUs")} />
              {errors.aboutUs && <p className="text-sm text-destructive">{errors.aboutUs.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Submitting..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
