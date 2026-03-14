import { useState } from "react"
import { GlobeDemo } from "@/components/ui/globe-demo"
import { TorontoMap } from "@/components/TorontoMap"

function App() {
  const [view, setView] = useState("globe")

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">StreetSafe</h1>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setView("globe")}
            className={`rounded px-3 py-1 ${view === "globe" ? "bg-slate-100 text-slate-900" : "bg-slate-800"}`}
          >
            Global view
          </button>
          <button
            onClick={() => setView("toronto")}
            className={`rounded px-3 py-1 ${view === "toronto" ? "bg-slate-100 text-slate-900" : "bg-slate-800"}`}
          >
            Toronto dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
        {view === "globe" ? (
          <section className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight">
                Global safety signals at a glance
              </h2>
              <p className="text-sm text-slate-300">
                StreetSafe aggregates reports from edge cameras and community members to
                highlight hotspots of potholes, unsafe intersections, and other hazards.
              </p>
              <button
                onClick={() => setView("toronto")}
                className="mt-2 rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
              >
                Focus on Toronto
              </button>
              <p className="text-xs text-slate-400">
                Tip: click or drag the globe toward Toronto to explore the region, then switch
                into the Toronto dashboard view.
              </p>
            </div>
            <GlobeDemo onFocusToronto={() => setView("toronto")} />
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <TorontoMap />
            <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="text-lg font-semibold">Toronto safety insights</h2>
              <p className="text-sm text-slate-300">
                This mock dashboard highlights clusters of reported issues across Downtown,
                North York, Scarborough, and Etobicoke. Heatmap intensity reflects repeat
                reports and severity, while markers remain clickable for issue details.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
