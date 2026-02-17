"use client"

import React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createAgent } from "@/lib/storage"
import { CRM_OPTIONS } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

const schema = z.object({
  classification: z.enum(["residential", "commercial"]),
  agentType: z.enum(["selling", "leasing"]),
  agencyName: z.string().min(1, "Agency name is required"),
  principalName: z.string().min(1, "Principal name is required"),
  principalEmail: z.string().email("Valid email required"),
  principalMobile: z.string().min(8, "Principal mobile is required"),
  officeUrl: z.string().optional(),
  crm: z.string().min(1, "Select a CRM"),
  uniqueAgentId: z.string().min(1, "Enter your Unique Agent ID from your CRM"),
  name: z.string().min(1, "Agent name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Phone is required"),
  password: z.string().min(9, "Min 9 characters"),
  suburb: z.string().min(1, "Suburb is required"),
  postcode: z.string().min(4).max(4),
  propertiesSold: z.coerce.number().min(0),
  numberOfListings: z.coerce.number().min(0),
  averageSoldPrice: z.coerce.number().min(0),
})

type FormValues = z.infer<typeof schema>

export default function AgentRegistrationPage() {
  const [submitted, setSubmitted] = useState(false)
  const [agencyLogoPreview, setAgencyLogoPreview] = useState("")
  const [photoPreview, setPhotoPreview] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      classification: "residential",
      agentType: "selling",
      agencyName: "",
      principalName: "",
      principalEmail: "",
      principalMobile: "",
      officeUrl: "",
      crm: "",
      uniqueAgentId: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      suburb: "",
      postcode: "",
      propertiesSold: 0,
      numberOfListings: 0,
      averageSoldPrice: 0,
    },
  })

  function handleFile(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onloadend = () => setter(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  function onSubmit(data: FormValues) {
    createAgent({
      classification: data.classification,
      agentType: data.agentType,
      agencyLogo: agencyLogoPreview,
      agencyName: data.agencyName,
      principalName: data.principalName,
      principalEmail: data.principalEmail,
      principalMobile: data.principalMobile,
      officeUrl: data.officeUrl ?? "",
      crm: data.crm,
      uniqueAgentId: data.uniqueAgentId,
      name: data.name,
      photo: photoPreview,
      email: data.email,
      phone: data.phone,
      password: data.password,
      suburb: data.suburb,
      postcode: data.postcode,
      propertiesSold: data.propertiesSold,
      numberOfListings: data.numberOfListings,
      averageSoldPrice: data.averageSoldPrice,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex justify-center py-8">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <h2 className="text-xl font-bold text-foreground">Submitted for Review</h2>
            <p className="text-sm text-muted-foreground">
              Your agent profile has been submitted and is pending admin approval.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Register as an Agent</CardTitle>
          <CardDescription>Create your agent profile. It will be reviewed before going live.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Classification *</Label>
              <RadioGroup value={watch("classification")} onValueChange={(v) => setValue("classification", v as "residential" | "commercial")} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="residential" id="ar-res" />
                  <Label htmlFor="ar-res">Residential</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="commercial" id="ar-com" />
                  <Label htmlFor="ar-com">Commercial</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Agent Type *</Label>
              <RadioGroup value={watch("agentType")} onValueChange={(v) => setValue("agentType", v as "selling" | "leasing")} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="selling" id="ar-sell" />
                  <Label htmlFor="ar-sell">Selling agent</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="leasing" id="ar-lease" />
                  <Label htmlFor="ar-lease">Leasing agent</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Agency Logo</Label>
              <Input type="file" accept="image/*" onChange={handleFile(setAgencyLogoPreview)} />
              {agencyLogoPreview && <img src={agencyLogoPreview || "/placeholder.svg"} alt="Agency logo" className="h-12 w-12 rounded object-cover" />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ar-agname">Agency Name *</Label>
              <Input id="ar-agname" {...register("agencyName")} />
              {errors.agencyName && <p className="text-sm text-destructive">{errors.agencyName.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ar-principal">Principal Name *</Label>
              <Input id="ar-principal" {...register("principalName")} />
              {errors.principalName && <p className="text-sm text-destructive">{errors.principalName.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ar-principal-email">Principal Email *</Label>
                <Input id="ar-principal-email" type="email" {...register("principalEmail")} />
                {errors.principalEmail && <p className="text-sm text-destructive">{errors.principalEmail.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ar-principal-mobile">Principal Mobile *</Label>
                <Input id="ar-principal-mobile" type="tel" {...register("principalMobile")} />
                {errors.principalMobile && <p className="text-sm text-destructive">{errors.principalMobile.message}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ar-office">Office URL</Label>
              <Input id="ar-office" type="url" placeholder="e.g. www.youragency.com.au/suburb" {...register("officeUrl")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>CRM *</Label>
              <Select value={watch("crm")} onValueChange={(v) => setValue("crm", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CRM" />
                </SelectTrigger>
                <SelectContent>
                  {CRM_OPTIONS.map((crm) => (
                    <SelectItem key={crm} value={crm}>{crm}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.crm && <p className="text-sm text-destructive">{errors.crm.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ar-unique-id">Enter your Unique Agent ID from your CRM *</Label>
              <Input id="ar-unique-id" {...register("uniqueAgentId")} />
              {errors.uniqueAgentId && <p className="text-sm text-destructive">{errors.uniqueAgentId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Agent Photo</Label>
              <Input type="file" accept="image/*" onChange={handleFile(setPhotoPreview)} />
              {photoPreview && <img src={photoPreview || "/placeholder.svg"} alt="Agent photo" className="h-12 w-12 rounded-full object-cover" />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ar-name">Agent Name *</Label>
              <Input id="ar-name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ar-email">Email *</Label>
                <Input id="ar-email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ar-phone">Phone *</Label>
                <Input id="ar-phone" type="tel" {...register("phone")} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ar-pw">Password *</Label>
              <Input id="ar-pw" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ar-sub">Suburb *</Label>
                <Input id="ar-sub" {...register("suburb")} />
                {errors.suburb && <p className="text-sm text-destructive">{errors.suburb.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ar-pc">Postcode *</Label>
                <Input id="ar-pc" {...register("postcode")} />
                {errors.postcode && <p className="text-sm text-destructive">{errors.postcode.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ar-sold">Properties Sold *</Label>
                <Input id="ar-sold" type="number" {...register("propertiesSold")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ar-list">Listings *</Label>
                <Input id="ar-list" type="number" {...register("numberOfListings")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ar-avg">Avg Sold Price *</Label>
                <Input id="ar-avg" type="number" {...register("averageSoldPrice")} />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Submitting..." : "Register Agent"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
