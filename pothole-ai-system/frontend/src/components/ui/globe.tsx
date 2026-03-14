"use client"

import createGlobe, { type COBEOptions } from "cobe"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react"

import { cn } from "@/lib/utils"
import type { Report, Severity } from "@/types/report"

type GlobeProps = {
  className?: string
  reports: Report[]
  onFocusToronto?: () => void
  configOverride?: Partial<COBEOptions>
}

type Cluster = {
  latitude: number
  longitude: number
  count: number
  maxSeverity: Severity
}

const BASE_SIZES: Record<Severity, number> = {
  low: 0.03,
  medium: 0.06,
  high: 0.1,
}

function clusterReports(reports: Report[]): Cluster[] {
  const maxDistanceDegrees = 0.8 // loose clustering for globe-scale view
  const clusters: Cluster[] = []

  for (const report of reports) {
    let foundCluster: Cluster | null = null

    for (const cluster of clusters) {
      const dLat = report.latitude - cluster.latitude
      const dLon = report.longitude - cluster.longitude
      const distance = Math.sqrt(dLat * dLat + dLon * dLon)

      if (distance <= maxDistanceDegrees) {
        foundCluster = cluster
        break
      }
    }

    if (foundCluster) {
      // Update cluster
      const newCount = foundCluster.count + 1
      foundCluster.latitude =
        (foundCluster.latitude * foundCluster.count + report.latitude) /
        newCount
      foundCluster.longitude =
        (foundCluster.longitude * foundCluster.count + report.longitude) /
        newCount
      foundCluster.count = newCount

      if (
        (report.severity === "high" && foundCluster.maxSeverity !== "high") ||
        (report.severity === "medium" && foundCluster.maxSeverity === "low")
      ) {
        foundCluster.maxSeverity = report.severity
      }
    } else {
      clusters.push({
        latitude: report.latitude,
        longitude: report.longitude,
        count: 1,
        maxSeverity: report.severity,
      })
    }
  }

  return clusters
}

function clustersToMarkers(clusters: Cluster[]): COBEOptions["markers"] {
  return clusters.map((cluster) => {
    const baseSize = BASE_SIZES[cluster.maxSeverity]

    let size = baseSize
    if (cluster.count >= 5) {
      size = Math.max(size, 0.1)
    } else if (cluster.count >= 3) {
      size = Math.max(size, 0.06)
    }

    return {
      location: [cluster.latitude, cluster.longitude] as [number, number],
      size,
    }
  })
}

const BASE_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [],
}

export function Globe({
  className,
  reports,
  onFocusToronto,
  configOverride,
}: GlobeProps) {
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)
  const [hasError, setHasError] = useState(false)

  const clusters = useMemo(() => clusterReports(reports), [reports])
  const markers = useMemo(() => clustersToMarkers(clusters), [clusters])

  const config: COBEOptions = useMemo(
    () => ({
      ...BASE_GLOBE_CONFIG,
      ...configOverride,
      markers,
    }),
    [markers, configOverride],
  )

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r],
  )

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth
    }
  }

  useEffect(() => {
    if (!canvasRef.current) return

    try {
      window.addEventListener("resize", onResize)
      onResize()

      const globe = createGlobe(canvasRef.current, {
        ...config,
        width: width * 2,
        height: width * 2,
        onRender,
      })

      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.style.opacity = "1"
        }
      })

      return () => {
        globe.destroy()
        window.removeEventListener("resize", onResize)
      }
    } catch (err) {
      console.error("Failed to initialise globe visualisation", err)
      setHasError(true)
    }
  }, [config, onRender])

  const handleClick = () => {
    // For now, treat any click as an intent to focus on Toronto.
    if (onFocusToronto) {
      onFocusToronto()
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    updateMovement(e.clientX)
  }

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    if (e.touches[0]) {
      updateMovement(e.touches[0].clientX)
    }
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-lg bg-slate-900/80",
          className,
        )}
      >
        <span className="text-xs text-slate-400">
          Globe visualisation unavailable in this browser.
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onClick={handleClick}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      />
    </div>
  )
}

