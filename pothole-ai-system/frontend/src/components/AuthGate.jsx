import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/**
 * Redirects unauthenticated users to /login.
 * If authenticated and redirectTo is set, redirects there; otherwise renders children.
 * Use so the app flow starts with login/sign-in first.
 */
export function AuthGate({ children, redirectTo }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
