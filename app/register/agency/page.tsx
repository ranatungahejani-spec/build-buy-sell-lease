"use client"

import React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createAgency } from "@/lib/storage"
import { CRM_OPTIONS } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const schema = z.object({
  classification: z.enum(["residential", "commercial", "both"]),
  name: z.string().min(1, "Agency name is required"),
  principalName: z.string().min(1, "Principal name is required"),
  principalEmail: z.string().email("Valid email required"),
  principalMobile: z.string().min(8, "Principal mobile is required"),
  streetAddress: z.string().optional(),
  suburb: z.string().min(1, "Suburb is required"),
  state: z.string().min(1, "State is required"),
  postcode: z.string().min(4).max(4),
  phone: z.string().min(8, "Phone is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(9, "Min 9 characters"),
  officeUrl: z.string().url().optional().or(z.literal("")),
  crm: z.string().min(1, "Select a CRM"),
})

type FormValues = z.infer<typeof schema>

export default function AgencyRegistrationPage() {
  const [submitted, setSubmitted] = useState(false)
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
      classification: "residential",
      crm: "",
      name: "",
      principalName: "",
      principalEmail: "",
      principalMobile: "",
      streetAddress: "",
      suburb: "",
      state: "",
      postcode: "",
      phone: "",
      email: "",
      password: "",
      officeUrl: "",
    },
  })

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function onSubmit(data: FormValues) {
    createAgency({
      classification: data.classification,
      logo: logoPreview,
      name: data.name,
      principalName: data.principalName,
      principalEmail: data.principalEmail,
      principalMobile: data.principalMobile,
      streetAddress: data.streetAddress ?? "",
      suburb: data.suburb,
      state: data.state,
      postcode: data.postcode,
      phone: data.phone,
      email: data.email,
      password: data.password,
      officeUrl: data.officeUrl ?? "",
      crm: data.crm,
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
              Your agency profile has been submitted and is pending admin approval. You will be able to sign in once approved.
            </p>
            <div className="rounded-md border border-border bg-muted/50 p-3 text-left text-sm text-muted-foreground">
              <p className="font-medium text-foreground">CRM Workflow Note</p>
              <p className="mt-1">
                Agencies already have a CRM. When they register they select who they are using.
                We send an email to their CRM confirming they have joined and want properties continuously pushed.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => toast.success("Email queued (stub)")}
            >
              Send CRM confirmation email (stub)
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
          <CardTitle>Register Your Agency</CardTitle>
          <CardDescription>Create your agency profile. It will be reviewed before going live.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Classification *</Label>
              <RadioGroup
                value={watch("classification")}
                onValueChange={(v) => setValue("classification", v as "residential" | "commercial" | "both")}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="residential" id="r-res" />
                  <Label htmlFor="r-res">Residential</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="commercial" id="r-com" />
                  <Label htmlFor="r-com">Commercial</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="both" id="r-both" />
                  <Label htmlFor="r-both">Both</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Logo</Label>
              <Input type="file" accept="image/*" onChange={handleLogo} />
              {logoPreview && <img src={logoPreview || "/placeholder.svg"} alt="Preview" className="h-16 w-16 rounded object-cover" />}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ag-name">Name of Agency *</Label>
              <Input id="ag-name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ag-principal">Principal Name *</Label>
              <Input id="ag-principal" {...register("principalName")} />
              {errors.principalName && <p className="text-sm text-destructive">{errors.principalName.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ag-principal-email">Principal Email *</Label>
                <Input id="ag-principal-email" type="email" {...register("principalEmail")} />
                {errors.principalEmail && <p className="text-sm text-destructive">{errors.principalEmail.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ag-principal-mobile">Principal Mobile *</Label>
                <Input id="ag-principal-mobile" type="tel" {...register("principalMobile")} />
                {errors.principalMobile && <p className="text-sm text-destructive">{errors.principalMobile.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ag-street">Street Address</Label>
              <Input id="ag-street" {...register("streetAddress")} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ag-sub">Suburb *</Label>
                <Input id="ag-sub" {...register("suburb")} />
                {errors.suburb && <p className="text-sm text-destructive">{errors.suburb.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ag-state">State *</Label>
                <Input id="ag-state" {...register("state")} placeholder="e.g. NSW" />
                {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ag-pc">Postcode *</Label>
                <Input id="ag-pc" {...register("postcode")} maxLength={4} />
                {errors.postcode && <p className="text-sm text-destructive">{errors.postcode.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ag-ph">Phone *</Label>
                <Input id="ag-ph" type="tel" {...register("phone")} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ag-em">Email *</Label>
                <Input id="ag-em" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ag-pw">Password *</Label>
              <Input id="ag-pw" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ag-office">Office URL</Label>
              <Input id="ag-office" type="url" placeholder="e.g. www.youragency.com.au/suburb" {...register("officeUrl")} />
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

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Submitting..." : "Register Agency"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
