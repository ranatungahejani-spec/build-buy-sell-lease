import Link from "next/link"
import { Building2, Users, Briefcase, Wrench, Search, UserCircle } from "lucide-react"

const sections = [
  { title: "Properties", desc: "Search residential and commercial properties for sale or lease.", href: "/properties", icon: Building2 },
  { title: "Find an Agent", desc: "Search real estate agents by suburb or postcode.", href: "/agents", icon: Users },
  { title: "Find an Agency", desc: "Browse agencies across Australia.", href: "/agencies", icon: Search },
  { title: "Real Estate Services", desc: "Find trusted professionals for buying, selling and leasing.", href: "/real-estate-services", icon: Briefcase },
  { title: "Real Estate Tools", desc: "Discover tools and business services for the real estate industry.", href: "/real-estate-tools", icon: Wrench },
  { title: "Careers", desc: "Explore opportunities across real estate.", href: "/careers", icon: UserCircle },
]

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-12 py-8">
      <div className="text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Buy Sell Lease
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
          Everything real estate, under one roof.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-6 text-card-foreground transition-colors hover:border-foreground/20 hover:bg-accent"
          >
            <s.icon className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-foreground" />
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
