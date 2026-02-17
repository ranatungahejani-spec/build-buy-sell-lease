"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createToolProvider } from "@/lib/storage"
import { TOOL_CATEGORIES } from "@/types"
import type { ToolCategory, CoverageRadius } from "@/types"
import { AU_STATES, getSuburbsByState } from "@/lib/au-suburbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

const RADIUS_OPTIONS: { value: CoverageRadius; label: string }[] = [
  { value: 5, label: "5 km" },
  { value: 25, label: "25 km" },
  { value: 50, label: "50 km" },
]

const schema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  principalName: z.string().min(1, "Principal name is required"),
  principalEmail: z.string().email("Valid email required"),
  principalMobile: z.string().min(8, "Principal mobile is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  suburb: z.string().min(1, "Suburb is required"),
  state: z.string().min(1, "State is required"),
  postcode: z.string().min(4, "Postcode is required").max(4),
  toolCategory: z.string().min(1, "Select a category"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Phone is required"),
  password: z.string().min(9, "Min 9 characters"),
  website: z.string().optional(),
  aboutUs: z.string().min(1, "About Us is required (up to 200 words)").max(1400, "About Us must be 200 words or less"),
})

type FormValues = z.infer<typeof schema>

export default function ToolRegistrationPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [selectedRadii, setSelectedRadii] = useState<CoverageRadius[]>([25])
  const [logoPreview, setLogoPreview] = useState("")

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
      principalEmail: "",
      principalMobile: "",
      streetAddress: "",
      suburb: "",
      state: "",
      postcode: "",
      toolCategory: "",
      email: "",
      phone: "",
      password: "",
      website: "",
      aboutUs: "",
    },
  })

  function toggleRadius(r: CoverageRadius) {
    setSelectedRadii((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    )
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function onSubmit(data: FormValues) {
    if (selectedRadii.length === 0) {
      return
    }
    const coverageAreas = selectedRadii.map((radiusKm) => ({
      suburb: data.suburb,
      postcode: data.postcode,
      state: data.state,
      radiusKm,
    }))

    const tp = createToolProvider({
      toolCategory: data.toolCategory as ToolCategory,
      businessName: data.businessName,
      principalName: data.principalName,
      principalEmail: data.principalEmail,
      principalMobile: data.principalMobile,
      streetAddress: data.streetAddress,
      suburb: data.suburb,
      state: data.state,
      postcode: data.postcode,
      email: data.email,
      phone: data.phone,
      password: data.password,
      website: data.website ?? "",
      coverageAreas,
      logo: logoPreview,
      aboutUs: data.aboutUs,
    })
    setSubmittedId(tp.toolId)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex justify-center py-8">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <h2 className="text-xl font-bold text-foreground">Thank you for joining</h2>
            <p className="text-sm text-muted-foreground">
              Your tool provider profile has been submitted. You will receive a confirmation email shortly.
            </p>
            {submittedId && (
              <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
                Your Tool ID: <strong>{submittedId}</strong>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Payment gateway is not set up yet. You will be directed to complete payment when ready.
            </p>
            <Button variant="outline" onClick={() => router.push("/real-estate-tools")}>
              Back to Real Estate Tools
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
          <CardTitle>Register as a Tool Provider</CardTitle>
          <CardDescription>List your real estate tool or business service.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tp-principal">Principal Name (Name of owner of business) *</Label>
              <Input id="tp-principal" {...register("principalName")} />
              {errors.principalName && <p className="text-sm text-destructive">{errors.principalName.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tp-principal-email">Principal Email *</Label>
                <Input id="tp-principal-email" type="email" {...register("principalEmail")} />
                {errors.principalEmail && <p className="text-sm text-destructive">{errors.principalEmail.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tp-principal-mobile">Principal Mobile *</Label>
                <Input id="tp-principal-mobile" type="tel" {...register("principalMobile")} />
                {errors.principalMobile && <p className="text-sm text-destructive">{errors.principalMobile.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tp-bn">Business Name *</Label>
              <Input id="tp-bn" {...register("businessName")} />
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

            <div className="flex flex-col gap-1.5">
              <Label>Categories * (from list only)</Label>
              <Select value={watch("toolCategory")} onValueChange={(v) => setValue("toolCategory", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {TOOL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toolCategory && <p className="text-sm text-destructive">{errors.toolCategory.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tp-web">Website</Label>
              <Input
                id="tp-web"
                type="url"
                placeholder="e.g. www.yourbusiness.com.au/maroubra"
                {...register("website")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Coverage Areas (from your postcode)</Label>
              <p className="text-xs text-muted-foreground">Select radius so you appear in search results.</p>
              <div className="flex gap-4">
                {RADIUS_OPTIONS.map((r) => (
                  <label key={r.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedRadii.includes(r.value)}
                      onChange={() => toggleRadius(r.value)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tp-em">Email *</Label>
                <Input id="tp-em" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tp-ph">Phone *</Label>
                <Input id="tp-ph" type="tel" {...register("phone")} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tp-pw">Password *</Label>
              <Input id="tp-pw" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Logo (e.g. JPEG accepted)</Label>
              <Input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleLogo} />
              {logoPreview && <img src={logoPreview} alt="Preview" className="h-12 w-12 rounded object-cover" />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tp-about">About Us * (200 word description)</Label>
              <Textarea id="tp-about" rows={5} maxLength={1400} placeholder="Describe your business (max 200 words)..." {...register("aboutUs")} />
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
