"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/store/auth-store"
import { getAgencyByEmail, getAgentByEmail } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { toast } from "sonner"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

function AgencySignIn() {
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(data: FormValues) {
    /* Replace with API later */
    const agency = getAgencyByEmail(data.email)
    if (!agency || agency.password !== data.password) {
      toast.error("Invalid email or password")
      return
    }
    signIn({
      userId: agency.id,
      email: agency.email,
      role: "agency",
      name: agency.name,
    })
    toast.success("Signed in as agency")
    router.push("/dashboard/agency")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="agency-email">Email</Label>
        <Input id="agency-email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="agency-pw">Password</Label>
        <Input id="agency-pw" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {"Don't have an agency account? "}
        <Link href="/register/agency" className="text-foreground underline">Register</Link>
      </p>
    </form>
  )
}

function AgentSignIn() {
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(data: FormValues) {
    /* Replace with API later */
    const agent = getAgentByEmail(data.email)
    if (!agent || agent.password !== data.password) {
      toast.error("Invalid email or password")
      return
    }
    signIn({
      userId: agent.id,
      email: agent.email,
      role: "agent",
      name: agent.name,
    })
    toast.success("Signed in as agent")
    router.push("/dashboard/agent")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="agent-email">Email</Label>
        <Input id="agent-email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="agent-pw">Password</Label>
        <Input id="agent-pw" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {"Don't have an agent account? "}
        <Link href="/register/agent" className="text-foreground underline">Register</Link>
      </p>
    </form>
  )
}

export default function PortalSignInPage() {
  const [tab, setTab] = useState("agency")

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Agent / Agency Sign In</CardTitle>
          <CardDescription>
            Sign in to your professional account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="agency" className="flex-1">Agency Sign In</TabsTrigger>
              <TabsTrigger value="agent" className="flex-1">Agent Sign In</TabsTrigger>
            </TabsList>
            <TabsContent value="agency">
              <AgencySignIn />
            </TabsContent>
            <TabsContent value="agent">
              <AgentSignIn />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
