import Link from "next/link"
import { Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CareersPage() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <Briefcase className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold text-foreground">Careers in Real Estate</h1>
      <p className="max-w-md text-muted-foreground">
        Explore career opportunities in the Australian real estate industry.
        Register as an agent or agency to get started.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/careers">Find Career opportunities</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/register/agency">Post a real estate job</Link>
        </Button>
      </div>
    </div>
  )
}
