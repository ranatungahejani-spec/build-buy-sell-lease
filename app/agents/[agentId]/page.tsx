"use client"

import { use, useState } from "react"
import { getAgentById, getReviewsFor, createReview } from "@/lib/storage"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Mail, Phone, Star, Building2, Video, ImageIcon } from "lucide-react"
import { toast } from "sonner"

export default function AgentProfilePage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params)
  const agent = getAgentById(agentId)
  const session = useAuthStore((s) => s.session)
  const [reviews, setReviews] = useState(() => getReviewsFor(agentId))
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  if (!agent) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <User className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Agent not found.</p>
      </div>
    )
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null

  function handleAddReview() {
    if (!session) return
    createReview({
      targetId: agentId,
      targetType: "agent",
      authorId: session.userId,
      authorName: session.name,
      rating,
      comment,
    })
    setReviews(getReviewsFor(agentId))
    setComment("")
    setRating(5)
    setReviewOpen(false)
    toast.success("Review added")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
          {agent.photo ? (
            <img src={agent.photo || "/placeholder.svg"} alt={agent.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {agent.agencyLogo ? (
              <img src={agent.agencyLogo || "/placeholder.svg"} alt="" className="h-5 w-5 rounded object-cover" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            {agent.agencyName}
          </div>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {agent.classification} &middot; {agent.agentType} agent
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Contact */}
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <a href={`mailto:${agent.email}`} className="flex items-center gap-1 text-foreground hover:underline">
              <Mail className="h-3 w-3" /> {agent.email}
            </a>
            <a href={`tel:${agent.phone}`} className="flex items-center gap-1 text-foreground hover:underline">
              <Phone className="h-3 w-3" /> {agent.phone}
            </a>
            <div className="mt-2 flex gap-2">
              <Button size="sm" asChild>
                <a href={`mailto:${agent.email}`}><Mail className="mr-1 h-3 w-3" /> Email</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${agent.phone}`}><Phone className="mr-1 h-3 w-3" /> Call</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader><CardTitle className="text-base">Statistics</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col rounded-md border border-border p-2 text-center">
                <span className="text-lg font-bold text-foreground">{agent.propertiesSold}</span>
                <span className="text-muted-foreground">Sold</span>
              </div>
              <div className="flex flex-col rounded-md border border-border p-2 text-center">
                <span className="text-lg font-bold text-foreground">{agent.numberOfListings}</span>
                <span className="text-muted-foreground">Listings</span>
              </div>
              <div className="flex flex-col rounded-md border border-border p-2 text-center">
                <span className="text-lg font-bold text-foreground">
                  ${agent.averageSoldPrice.toLocaleString()}
                </span>
                <span className="text-muted-foreground">Avg price</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholders */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
            <Video className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Video</p>
            <p className="text-xs text-muted-foreground">Agent video coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Media Gallery</p>
            <p className="text-xs text-muted-foreground">Photos and media coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Reviews ({reviews.length})
            {avgRating && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {avgRating} <Star className="inline h-3 w-3" />
              </span>
            )}
          </CardTitle>
          {session?.role === "consumer" && (
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">Add Review</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Write a Review</DialogTitle></DialogHeader>
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
    </div>
  )
}
