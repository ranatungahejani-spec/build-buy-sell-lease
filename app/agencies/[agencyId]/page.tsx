"use client"

import { use, useState } from "react"
import { getAgencyById, getReviewsFor, createReview } from "@/lib/storage"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Mail, Phone, ExternalLink, Star } from "lucide-react"
import { toast } from "sonner"

export default function AgencyProfilePage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = use(params)
  const agency = getAgencyById(agencyId)
  const session = useAuthStore((s) => s.session)
  const [reviews, setReviews] = useState(() => getReviewsFor(agencyId))
  const [contactOpen, setContactOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [contactMsg, setContactMsg] = useState("")

  if (!agency) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Agency not found.</p>
      </div>
    )
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "No reviews"

  function handleAddReview() {
    if (!session) return
    createReview({
      targetId: agencyId,
      targetType: "agency",
      authorId: session.userId,
      authorName: session.name,
      rating,
      comment,
    })
    setReviews(getReviewsFor(agencyId))
    setComment("")
    setRating(5)
    setReviewOpen(false)
    toast.success("Review added")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
          {agency.logo ? (
            <img src={agency.logo || "/placeholder.svg"} alt={agency.name} className="h-16 w-16 rounded object-cover" />
          ) : (
            <Building2 className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{agency.name}</h1>
          <p className="text-sm text-muted-foreground capitalize">{agency.classification}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {agency.streetAddress && <p>{agency.streetAddress}</p>}
            <p>{agency.suburb}, {agency.postcode}</p>
            <a href={`tel:${agency.phone}`} className="flex items-center gap-1 text-foreground hover:underline">
              <Phone className="h-3 w-3" /> {agency.phone}
            </a>
            <a href={`mailto:${agency.email}`} className="flex items-center gap-1 text-foreground hover:underline">
              <Mail className="h-3 w-3" /> {agency.email}
            </a>
            {agency.meetTheTeamUrl && (
              <a href={agency.meetTheTeamUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-foreground hover:underline">
                <ExternalLink className="h-3 w-3" /> Meet the Team
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col rounded-md border border-border p-2">
                <span className="text-lg font-bold text-foreground">{agency.soldCurrentYear}</span>
                <span className="text-muted-foreground">Sold this year</span>
              </div>
              <div className="flex flex-col rounded-md border border-border p-2">
                <span className="text-lg font-bold text-foreground">{agency.forSale}</span>
                <span className="text-muted-foreground">For sale</span>
              </div>
              <div className="flex flex-col rounded-md border border-border p-2">
                <span className="text-lg font-bold text-foreground">{agency.leasedCurrentYear}</span>
                <span className="text-muted-foreground">Leased this year</span>
              </div>
              <div className="flex flex-col rounded-md border border-border p-2">
                <span className="text-lg font-bold text-foreground">{agency.forLease}</span>
                <span className="text-muted-foreground">For lease</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Reviews ({reviews.length}) {typeof avgRating === "string" ? "" : `- ${avgRating}`}
            {typeof avgRating !== "string" && <Star className="ml-1 inline h-4 w-4 text-foreground" />}
          </CardTitle>
          {session?.role === "consumer" && (
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">Add Review</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Rating (1-5)</Label>
                    <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Comment</Label>
                    <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
                  </div>
                  <Button onClick={handleAddReview}>Submit Review</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{r.authorName}</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      {r.rating} <Star className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Us */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="self-start">
            <Mail className="mr-2 h-4 w-4" /> Email Us
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email {agency.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Textarea placeholder="Your message..." value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} />
            <Button onClick={() => { toast.success("Message sent (stub)"); setContactOpen(false); setContactMsg("") }}>
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
