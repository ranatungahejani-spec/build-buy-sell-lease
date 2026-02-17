"use client"

import { useAuthStore } from "@/store/auth-store"
import { getConsumerById } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const session = useAuthStore((s) => s.session)
  const router = useRouter()

  useEffect(() => {
    if (!session || session.role !== "consumer") {
      router.replace("/auth/consumer-sign-in")
    }
  }, [session, router])

  if (!session) return null

  const consumer = getConsumerById(session.userId)
  if (!consumer) return null

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3">
            {[
              ["Consumer ID", consumer.id],
              ["First Name", consumer.firstName],
              ["Surname", consumer.surname],
              ["Email", consumer.email],
              ["Mobile", consumer.mobile],
              ["Suburb", consumer.suburb],
              ["Postcode", consumer.postcode],
              ["Member Since", new Date(consumer.createdAt).toLocaleDateString("en-AU")],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                <dd className="text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
