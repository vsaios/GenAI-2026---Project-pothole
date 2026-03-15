import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import { MAPBOX_TOKEN } from "@/config/env"

const DEFAULT_CENTER: [number, number] = [-79.3832, 43.6532]

type ReportLocationMapProps = {
  lat: number
  lng: number
  onLocationChange: (lat: number, lng: number) => void
}

export function ReportLocationMap({ lat, lng, onLocationChange }: ReportLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [lng, lat],
      zoom: 14,
    })

    const marker = new mapboxgl.Marker({ color: "#3b82f6" })
      .setLngLat([lng, lat])
      .addTo(map)
    markerRef.current = marker

    map.on("click", (e) => {
      const { lng: newLng, lat: newLat } = e.lngLat
      marker.setLngLat([newLng, newLat])
      onLocationChange(newLat, newLng)
    })

    mapRef.current = map
    return () => {
      marker.remove()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [MAPBOX_TOKEN])

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat])
    }
    if (mapRef.current) {
      mapRef.current.setCenter([lng, lat])
    }
  }, [lat, lng])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 text-sm text-slate-400">
        Add VITE_MAPBOX_TOKEN to use map. Enter lat/lng manually below.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-48 w-full cursor-crosshair overflow-hidden rounded-lg border border-slate-800"
    />
  )
}
