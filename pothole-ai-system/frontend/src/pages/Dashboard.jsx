import { useState, useEffect } from "react"
import { HeroIntro } from "@/components/HeroIntro"
import { Mapbox3DMap } from "@/components/Mapbox3DMap"
import { useReports } from "@/context/ReportsContext"
import { useAuth } from "@/context/AuthContext"
import { torontoReports } from "@/mock/torontoReports"

export function Dashboard({ onNavigate }) {
  const { user, loading: authLoading, logout } = useAuth()
  const [showIntro, setShowIntro] = useState(true)
  const { reports, loading } = useReports()
  const allReports = loading
    ? torontoReports
    : [...reports, ...torontoReports.filter((m) => !reports.some((r) => r.id === m.id))]

  useEffect(() => {
    if (!authLoading && !user) {
      onNavigate("login")
    }
  }, [user, authLoading, onNavigate])

  async function handleLogout() {
    try {
      await logout()
      onNavigate("landing")
    } catch {
      onNavigate("landing")
    }
  }

  if (authLoading || !user) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </main>
    )
  }

  return (
    <main className="relative min-h-[calc(100vh-4rem)] bg-slate-950">
      <div className="absolute right-6 top-4 z-10 flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm">
        <span className="text-slate-300">{user.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded bg-slate-700 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-600"
        >
          Log out
        </button>
      </div>
      <Mapbox3DMap reports={allReports} userReportIds={reports.map((r) => r.id)} />
      {showIntro && <HeroIntro onComplete={() => setShowIntro(false)} />}
    </main>
  )
}
