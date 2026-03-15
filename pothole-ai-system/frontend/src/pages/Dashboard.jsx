import { useState } from "react"
import { HeroIntro } from "@/components/HeroIntro"
import { Mapbox3DMap } from "@/components/Mapbox3DMap"
import { useReports } from "@/context/ReportsContext"
import { torontoReports } from "@/mock/torontoReports"

export function Dashboard() {
  const [showIntro, setShowIntro] = useState(true)
  const { reports, loading } = useReports()
  const allReports = loading
    ? torontoReports
    : [...reports, ...torontoReports.filter((m) => !reports.some((r) => r.id === m.id))]

  return (
    <main className="relative min-h-[calc(100vh-4rem)] bg-slate-950">
      <Mapbox3DMap reports={allReports} userReportIds={reports.map((r) => r.id)} />
      {showIntro && <HeroIntro onComplete={() => setShowIntro(false)} />}
    </main>
  )
}
