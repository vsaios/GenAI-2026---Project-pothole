import { cn } from "@/lib/utils"
import { Globe } from "@/components/ui/globe"
import { torontoReports } from "@/mock/torontoReports"

type Map3DProps = {
  heightClass?: string
  className?: string
}

/**
 * COBE 3D globe for the Home page only. Dashboard and Toronto use Mapbox3DMap.
 */
export function Map3D({ heightClass = "h-[320px]", className }: Map3DProps) {
  return (
    <div className={cn("relative w-full", heightClass, className)}>
      <Globe
        className="mx-auto max-w-full md:!max-w-[520px]"
        reports={torontoReports}
        configOverride={{
          baseColor: [0.9, 0.9, 0.92],
          markerColor: [0.3, 0.95, 1],
          glowColor: [0.35, 0.82, 0.95],
          dark: 0,
          diffuse: 0.55,
          mapBrightness: 1.4,
        }}
      />
    </div>
  )
}

