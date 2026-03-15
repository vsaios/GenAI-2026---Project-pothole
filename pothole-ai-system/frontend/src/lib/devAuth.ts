/**
 * DEVELOPMENT-ONLY AUTHENTICATION BYPASS
 * Do not rely on this in production. When NODE_ENV/import.meta.env.DEV is not
 * development, this bypass is disabled and normal Supabase auth is used.
 */

const DEV_SESSION_KEY = "devSession"

export type DevSession = {
  user: { id: string; email: string }
  isAuthenticated: boolean
}

/** Vite equivalent of NODE_ENV === "development". Bypass is disabled in production builds. */
export function isDevAuthEnabled(): boolean {
  return import.meta.env.DEV === true
}

export function getDevSession(): DevSession | null {
  if (!isDevAuthEnabled()) return null
  try {
    const raw = localStorage.getItem(DEV_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DevSession
    return parsed?.isAuthenticated && parsed?.user ? parsed : null
  } catch {
    return null
  }
}

export function setDevSession(session: DevSession): void {
  if (!isDevAuthEnabled()) return
  localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session))
}

export function clearDevSession(): void {
  if (!isDevAuthEnabled()) return
  localStorage.removeItem(DEV_SESSION_KEY)
}
