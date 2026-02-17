"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/store/auth-store"
import { createConsumer, getConsumerByEmail } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Enter a valid email"),
  mobile: z.string().min(8, "Enter a valid mobile number"),
  suburb: z.string().min(1, "Suburb is required"),
  postcode: z.string().min(4, "Enter a valid postcode").max(4, "Enter a valid postcode"),
  password: z
    .string()
    .min(8, "Minimum 8 characters required"),
})

type FormValues = z.infer<typeof schema>

function PasswordCheck({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={met ? "text-green-600" : "text-muted-foreground"}>{label}</span>
    </div>
  )
}

export default function ConsumerSignUpPage() {
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      surname: "",
      email: "",
      mobile: "",
      suburb: "",
      postcode: "",
      password: "",
    },
  })

  const pw = watch("password") ?? ""

  const checks = {
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
    numeric: /[0-9]/.test(pw),
  }

  const allChecksMet = pw.length >= 8 && checks.upper && checks.lower && checks.special && checks.numeric

  function onSubmit(data: FormValues) {
    if (!allChecksMet) {
      toast.error("Password does not meet all requirements")
      return
    }

    const existing = getConsumerByEmail(data.email)
    if (existing) {
      toast.error("An account with that email already exists")
      return
    }

    const consumer = createConsumer(data)
    signIn({
      userId: consumer.id,
      email: consumer.email,
      role: "consumer",
      name: `${consumer.firstName} ${consumer.surname}`,
    })
    toast.success("Account created successfully")
    router.push("/profile")
  }

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Sign up as a consumer to save properties and leave reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">First name *</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="surname">Surname *</Label>
                <Input id="surname" {...register("surname")} />
                {errors.surname && (
                  <p className="text-sm text-destructive">{errors.surname.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mobile">Mobile number *</Label>
              <Input id="mobile" type="tel" {...register("mobile")} />
              {errors.mobile && (
                <p className="text-sm text-destructive">{errors.mobile.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="suburb">Suburb *</Label>
                <Input id="suburb" {...register("suburb")} />
                {errors.suburb && (
                  <p className="text-sm text-destructive">{errors.suburb.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="postcode">Postcode *</Label>
                <Input id="postcode" {...register("postcode")} />
                {errors.postcode && (
                  <p className="text-sm text-destructive">{errors.postcode.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" placeholder="Minimum 8 characters required" {...register("password")} />
              <p className="text-xs text-muted-foreground">Minimum 8 characters required</p>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="rounded-md border border-border bg-muted/50 p-3">
              <p className="mb-2 text-sm font-medium text-foreground">Password requirements</p>
              <div className="flex flex-col gap-1">
                <PasswordCheck label="Require uppercase character" met={checks.upper} />
                <PasswordCheck label="Require lowercase character" met={checks.lower} />
                <PasswordCheck label="Require special character" met={checks.special} />
                <PasswordCheck label="Require numeric character" met={checks.numeric} />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/consumer-sign-in" className="text-foreground underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
