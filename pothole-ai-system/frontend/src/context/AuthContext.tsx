import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"
import * as auth from "@/lib/auth"
import * as devAuth from "@/lib/devAuth"

/** User is either Supabase User or dev bypass user (id + email only). */
export type AuthUser = User | { id: string; email: string } | null

type AuthContextValue = {
  user: AuthUser
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** DEVELOPMENT-ONLY: set fake session for auth bypass. No-op in production. */
  setDevSession: (session: devAuth.DevSession) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [devUser, setDevUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Resolved user: real Supabase user takes precedence; otherwise dev session (development-only).
  const user: AuthUser = supabaseUser ?? devUser

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      // DEVELOPMENT-ONLY AUTHENTICATION BYPASS: allow access if devSession exists when no real session.
      if (devAuth.isDevAuthEnabled() && !session?.user) {
        const dev = devAuth.getDevSession()
        if (dev?.user) setDevUser(dev.user)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      // When a real session appears, clear dev user so we don't show dev email.
      if (session?.user) setDevUser(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loginFn = useCallback(async (email: string, password: string) => {
    // DEVELOPMENT-ONLY AUTHENTICATION BYPASS: skip Supabase and use fake session when in dev.
    if (devAuth.isDevAuthEnabled()) {
      const devSession: devAuth.DevSession = {
        user: { id: "dev-user", email: "dev@test.com" },
        isAuthenticated: true,
      }
      devAuth.setDevSession(devSession)
      setDevUser(devSession.user)
      return
    }
    await auth.login(email, password)
  }, [])

  const signUpFn = useCallback(async (email: string, password: string) => {
    // DEVELOPMENT-ONLY AUTHENTICATION BYPASS: skip Supabase and use fake session when in dev.
    if (devAuth.isDevAuthEnabled()) {
      const devSession: devAuth.DevSession = {
        user: { id: "dev-user", email: "dev@test.com" },
        isAuthenticated: true,
      }
      devAuth.setDevSession(devSession)
      setDevUser(devSession.user)
      return
    }
    await auth.signUp(email, password)
  }, [])

  const logoutFn = useCallback(async () => {
    // DEVELOPMENT-ONLY: clear fake session so protected routes require auth again.
    if (devAuth.isDevAuthEnabled()) {
      devAuth.clearDevSession()
      setDevUser(null)
    }
    await auth.logout()
  }, [])

  const setDevSession = useCallback((session: devAuth.DevSession) => {
    if (!devAuth.isDevAuthEnabled()) return
    devAuth.setDevSession(session)
    setDevUser(session.user)
  }, [])

  const value: AuthContextValue = {
    user,
    session,
    loading,
    login: loginFn,
    signUp: signUpFn,
    logout: logoutFn,
    setDevSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
