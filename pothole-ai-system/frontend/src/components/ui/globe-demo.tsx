import { Globe } from "@/components/ui/globe"
import { torontoReports } from "@/mock/torontoReports"

type GlobeDemoProps = {
  onFocusToronto?: () => void
}

export function GlobeDemo({ onFocusToronto }: GlobeDemoProps) {
  return (
    <div className="relative flex h-[320px] w-full max-w-lg items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-900 px-10 pb-10 pt-8 md:h-[380px] md:px-16 md:pb-24 md:shadow-xl">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-slate-50 to-slate-400/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent md:text-7xl">
        Globe
      </span>
      <Globe className="top-24" reports={torontoReports} onFocusToronto={onFocusToronto} />
      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.3),rgba(15,23,42,0))]" />
    </div>
  )
}

