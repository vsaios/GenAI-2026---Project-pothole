import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { HeroIntro } from "@/components/HeroIntro"
import { Mapbox3DMap } from "@/components/Mapbox3DMap"
import { useReports } from "@/context/ReportsContext"
import { dashboardReports } from "@/mock/dashboardReports"

export function Dashboard() {
  const { user } = useAuth()
  const [showIntro, setShowIntro] = useState(true)
  const { reports } = useReports()

  // If API reports are empty (e.g. local AI backend not available),
  // fall back to dashboard mock data that includes neighbouring cities.
  const baseReports = reports.length > 0 ? reports : dashboardReports

  return (
    <main className="relative min-h-[calc(100vh-4rem)] bg-slate-950">
      <p className="absolute left-6 top-4 z-10 text-xs text-slate-400">
        Welcome, {user?.email ?? ""}
      </p>
      <div className="absolute right-6 top-4 z-10 flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm">
        <Link
          to="/report"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Report incident
        </Link>
      </div>
      <Mapbox3DMap
        reports={baseReports}
        userReportIds={baseReports.map((r) => r.id)}
      />
      {showIntro && <HeroIntro onComplete={() => setShowIntro(false)} />}
    </main>
  )
}