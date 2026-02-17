"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/store/auth-store"
import { getConsumerByEmail } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

export default function ConsumerSignInPage() {
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function onSubmit(data: FormValues) {
    /* Replace with API later */
    // Admin shortcut
    if (data.email.endsWith("@admin.local")) {
      signIn({
        userId: "admin",
        email: data.email,
        role: "admin",
        name: "Admin",
      })
      toast.success("Signed in as admin")
      router.push("/admin/approvals")
      return
    }

    const consumer = getConsumerByEmail(data.email)
    if (!consumer || consumer.password !== data.password) {
      toast.error("Invalid email or password")
      return
    }

    signIn({
      userId: consumer.id,
      email: consumer.email,
      role: "consumer",
      name: `${consumer.firstName} ${consumer.surname}`,
    })
    toast.success("Signed in successfully")
    router.push("/profile")
  }

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Consumer Sign In</CardTitle>
          <CardDescription>
            Sign in to your consumer account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Minimum 8 characters required" {...register("password")} />
              <p className="text-xs text-muted-foreground">Minimum 8 characters required</p>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/consumer-sign-up" className="text-foreground underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
