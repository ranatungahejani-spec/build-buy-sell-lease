export type Role = "consumer" | "agency" | "agent" | "service" | "tool" | "admin"

export type ProfileStatus = "pending" | "approved" | "rejected" | "suspended"

export type Classification = "residential" | "commercial" | "both"

export type AgentType = "selling" | "leasing"

/* ── Consumer ── */
export interface ConsumerProfile {
  id: string
  role: "consumer"
  firstName: string
  surname: string
  email: string
  mobile: string
  suburb: string
  postcode: string
  password: string
  createdAt: string
}

/* ── Agency ── */
export const CRM_OPTIONS = [
  "Mantis Property",
  "IDashboard",
  "Agentpoint",
  "Aro Software",
  "Inspect RE",
  "Box & Dice",
  "Reapit (Agentbox)",
  "Agentware",
  "Zenu",
  "Arosoftware",
  "Realty CMS",
  "Subtle Difference",
  "Renet",
  "iProperty",
  "Inhabit",
  "Rex Software",
  "Coreweb",
  "Mutliarray",
  "LockedOn",
  "CD Complete Data",
  "Console Group",
  "List Once",
] as const

export interface AgencyProfile {
  id: string
  role: "agency"
  status: ProfileStatus
  classification: Classification
  logo: string
  name: string
  principalName: string
  principalEmail: string
  principalMobile: string
  streetAddress: string
  suburb: string
  state: string
  postcode: string
  phone: string
  email: string
  password: string
  officeUrl: string
  crm: string
  reviewsScore: number
  soldCurrentYear: number
  forSale: number
  leasedCurrentYear: number
  forLease: number
  createdAt: string
}

/* ── Agent ── */
export interface AgentProfile {
  id: string
  role: "agent"
  status: ProfileStatus
  classification: Classification
  agentType: AgentType
  agencyLogo: string
  agencyName: string
  name: string
  principalName: string
  principalEmail: string
  principalMobile: string
  officeUrl: string
  crm: string
  uniqueAgentId: string
  photo: string
  email: string
  phone: string
  password: string
  suburb: string
  postcode: string
  propertiesSold: number
  numberOfListings: number
  averageSoldPrice: number
  createdAt: string
}

/* ── Service Provider ── */
export const SERVICE_CATEGORIES = [
  "Conveyancers/Solicitors",
  "Mortgage Brokers/Finance",
  "Landlord and property Insurance",
  "Valuations",
  "Depreciation reports",
  "Buyers Agents",
  "Land Surveyors",
  "Pest and Building Reports",
  "Removalists and Storage",
  "Rubbish Removal",
  "Painting",
  "Cleaning",
  "Gardening and Landscape",
  "Utilities and Streaming",
  "Carpet Cleaning",
  "Locksmiths and Security",
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export type ServiceAreaRadius = 5 | 25 | 50

export interface ServiceAreaWithRadius {
  suburb: string
  postcode: string
  state: string
  radiusKm: ServiceAreaRadius
}

export interface ServiceProvider {
  id: string
  serviceId: string
  role: "service"
  status: ProfileStatus
  businessName: string
  principalName: string
  streetAddress: string
  suburb: string
  state: string
  postcode: string
  phone: string
  email: string
  password: string
  website: string
  categories: ServiceCategory[]
  serviceAreas: ServiceAreaWithRadius[]
  logo: string
  aboutUs: string
  createdAt: string
}

/* ── Tool Provider ── */
export const TOOL_CATEGORIES = [
  "Furniture Hire and Property Styling",
  "Photography",
  "Videography",
  "Floorplans",
  "Copy writers",
  "Auctioneers",
  "Training and Mentoring",
  "Software and Hardware",
  "CRM's",
  "Franchise Real Estate Groups",
  "Trust Account Auditors",
  "Front Window Display",
  "Printing and Stationery",
  "Signage and Signboards",
  "Corporate Merchandise and Gifts",
  "Marketing and Social Media",
] as const

export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

export type CoverageRadius = 5 | 25 | 50

export interface ToolProvider {
  id: string
  toolId: string
  role: "tool"
  status: ProfileStatus
  toolCategory: ToolCategory
  businessName: string
  principalName: string
  principalEmail: string
  principalMobile: string
  streetAddress: string
  suburb: string
  state: string
  postcode: string
  email: string
  phone: string
  password: string
  website: string
  coverageAreas: { suburb: string; postcode: string; state: string; radiusKm: CoverageRadius }[]
  logo: string
  aboutUs: string
  createdAt: string
}

/* ── Review ── */
export interface Review {
  id: string
  targetId: string
  targetType: "agency" | "agent"
  authorId: string
  authorName: string
  rating: number
  comment: string
  createdAt: string
}

/* ── Session ── */
export interface Session {
  userId: string
  email: string
  role: Role
  name: string
}
