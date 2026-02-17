"use client"

import { create } from "zustand"
import type { Session, Role } from "@/types"

const SESSION_KEY = "bsl_session"

function loadSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

interface AuthState {
  session: Session | null
  hydrated: boolean
  hydrate: () => void
  signIn: (session: Session) => void
  signOut: () => void
  isAdmin: () => boolean
  hasRole: (role: Role) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  hydrated: false,

  hydrate: () => {
    const session = loadSession()
    set({ session, hydrated: true })
  },

  signIn: (session: Session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    set({ session })
  },

  signOut: () => {
    localStorage.removeItem(SESSION_KEY)
    set({ session: null })
  },

  isAdmin: () => {
    const s = get().session
    return s?.email?.endsWith("@admin.local") ?? false
  },

  hasRole: (role: Role) => {
    const s = get().session
    return s?.role === role
  },
}))
