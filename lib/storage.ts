/**
 * localStorage-based repository.
 * Replace with API calls later.
 */
import type {
  ConsumerProfile,
  AgencyProfile,
  AgentProfile,
  ServiceProvider,
  ToolProvider,
  Review,
  ProfileStatus,
} from "@/types"

/* ── helpers ── */
function getList<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function setList<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items))
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/* ── CONSUMERS ── */
const CK = "bsl_consumers"

export function getConsumers(): ConsumerProfile[] {
  return getList<ConsumerProfile>(CK)
}

export function getConsumerById(id: string) {
  return getConsumers().find((c) => c.id === id) ?? null
}

export function getConsumerByEmail(email: string) {
  return getConsumers().find((c) => c.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function createConsumer(data: Omit<ConsumerProfile, "id" | "role" | "createdAt">): ConsumerProfile {
  const consumer: ConsumerProfile = {
    ...data,
    id: genId(),
    role: "consumer",
    createdAt: new Date().toISOString(),
  }
  setList(CK, [...getConsumers(), consumer])
  return consumer
}

/* ── AGENCIES ── */
const AK = "bsl_agencies"

export function getAgencies(): AgencyProfile[] {
  return getList<AgencyProfile>(AK)
}

export function getApprovedAgencies(): AgencyProfile[] {
  return getAgencies().filter((a) => a.status === "approved")
}

export function getAgencyById(id: string) {
  return getAgencies().find((a) => a.id === id) ?? null
}

export function getAgencyByEmail(email: string) {
  return getAgencies().find((a) => a.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function createAgency(data: Omit<AgencyProfile, "id" | "role" | "status" | "createdAt" | "reviewsScore" | "soldCurrentYear" | "forSale" | "leasedCurrentYear" | "forLease">): AgencyProfile {
  const agency: AgencyProfile = {
    ...data,
    id: genId(),
    role: "agency",
    status: "pending",
    reviewsScore: 0,
    soldCurrentYear: 0,
    forSale: 0,
    leasedCurrentYear: 0,
    forLease: 0,
    createdAt: new Date().toISOString(),
  }
  setList(AK, [...getAgencies(), agency])
  // Stub: send auto email "Thank you for joining…"
  if (typeof window !== "undefined") {
    try {
      console.info("[Stub] Agency welcome email would be sent to", agency.email)
    } catch {}
  }
  return agency
}

export function updateAgencyStatus(id: string, status: ProfileStatus) {
  const list = getAgencies().map((a) => (a.id === id ? { ...a, status } : a))
  setList(AK, list)
}

export function updateAgency(id: string, data: Partial<AgencyProfile>) {
  const list = getAgencies().map((a) => (a.id === id ? { ...a, ...data } : a))
  setList(AK, list)
}

/* ── AGENTS ── */
const AGK = "bsl_agents"

export function getAgents(): AgentProfile[] {
  return getList<AgentProfile>(AGK)
}

export function getApprovedAgents(): AgentProfile[] {
  return getAgents().filter((a) => a.status === "approved")
}

export function getAgentById(id: string) {
  return getAgents().find((a) => a.id === id) ?? null
}

export function getAgentByEmail(email: string) {
  return getAgents().find((a) => a.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function createAgent(data: Omit<AgentProfile, "id" | "role" | "status" | "createdAt">): AgentProfile {
  const agent: AgentProfile = {
    ...data,
    id: genId(),
    role: "agent",
    status: "pending",
    createdAt: new Date().toISOString(),
  }
  setList(AGK, [...getAgents(), agent])
  if (typeof window !== "undefined") {
    try {
      console.info("[Stub] Agent welcome email would be sent to", agent.email)
    } catch {}
  }
  return agent
}

export function updateAgentStatus(id: string, status: ProfileStatus) {
  const list = getAgents().map((a) => (a.id === id ? { ...a, status } : a))
  setList(AGK, list)
}

export function updateAgent(id: string, data: Partial<AgentProfile>) {
  const list = getAgents().map((a) => (a.id === id ? { ...a, ...data } : a))
  setList(AGK, list)
}

/* ── SERVICE PROVIDERS ── */
const SK = "bsl_services"

export function getServiceProviders(): ServiceProvider[] {
  return getList<ServiceProvider>(SK)
}

export function getApprovedServiceProviders(): ServiceProvider[] {
  return getServiceProviders().filter((s) => s.status === "approved")
}

export function getServiceProviderById(id: string) {
  return getServiceProviders().find((s) => s.id === id) ?? null
}

export function getServiceProviderByEmail(email: string) {
  return getServiceProviders().find((s) => s.email.toLowerCase() === email.toLowerCase()) ?? null
}

function genServiceId() {
  return "SVC-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()
}

export function createServiceProvider(data: Omit<ServiceProvider, "id" | "serviceId" | "role" | "status" | "createdAt">): ServiceProvider {
  const serviceId = genServiceId()
  const sp: ServiceProvider = {
    ...data,
    id: genId(),
    serviceId,
    role: "service",
    status: "pending",
    createdAt: new Date().toISOString(),
  }
  setList(SK, [...getServiceProviders(), sp])
  if (typeof window !== "undefined") {
    try {
      console.info("[Stub] Thank you for joining email would be sent to", sp.email, "| Service ID:", serviceId)
    } catch {}
  }
  return sp
}

export function updateServiceProviderStatus(id: string, status: ProfileStatus) {
  const list = getServiceProviders().map((s) => (s.id === id ? { ...s, status } : s))
  setList(SK, list)
}

/* ── TOOL PROVIDERS ── */
const TK = "bsl_tools"

export function getToolProviders(): ToolProvider[] {
  return getList<ToolProvider>(TK)
}

export function getApprovedToolProviders(): ToolProvider[] {
  return getToolProviders().filter((t) => t.status === "approved")
}

export function getToolProviderById(id: string) {
  return getToolProviders().find((t) => t.id === id) ?? null
}

export function getToolProviderByEmail(email: string) {
  return getToolProviders().find((t) => t.email.toLowerCase() === email.toLowerCase()) ?? null
}

function genToolId() {
  return "TOL-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()
}

export function createToolProvider(data: Omit<ToolProvider, "id" | "toolId" | "role" | "status" | "createdAt">): ToolProvider {
  const toolId = genToolId()
  const tp: ToolProvider = {
    ...data,
    id: genId(),
    toolId,
    role: "tool",
    status: "pending",
    createdAt: new Date().toISOString(),
  }
  setList(TK, [...getToolProviders(), tp])
  if (typeof window !== "undefined") {
    try {
      console.info("[Stub] Thank you for joining email would be sent to", tp.email, "| Tool ID:", toolId)
    } catch {}
  }
  return tp
}

export function updateToolProviderStatus(id: string, status: ProfileStatus) {
  const list = getToolProviders().map((t) => (t.id === id ? { ...t, status } : t))
  setList(TK, list)
}

/* ── REVIEWS ── */
const RK = "bsl_reviews"

export function getReviews(): Review[] {
  return getList<Review>(RK)
}

export function getReviewsFor(targetId: string): Review[] {
  return getReviews().filter((r) => r.targetId === targetId)
}

export function createReview(data: Omit<Review, "id" | "createdAt">): Review {
  const review: Review = {
    ...data,
    id: genId(),
    createdAt: new Date().toISOString(),
  }
  setList(RK, [...getReviews(), review])
  return review
}
