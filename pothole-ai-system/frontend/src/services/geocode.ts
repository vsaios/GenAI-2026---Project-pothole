/**
 * Mapbox Geocoding: convert street/address text to coordinates.
 * Used by the chatbot to fly the map to a location (no UI search bar).
 */

const TORONTO_PROXIMITY = "-79.3832,43.6532"

export async function geocodeToToronto(
  query: string,
  token: string,
): Promise<{ lng: number; lat: number } | null> {
  if (!query.trim() || !token) return null
  const q = encodeURIComponent(`${query.trim()} Toronto, ON`)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${token}&limit=1&proximity=${TORONTO_PROXIMITY}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const feature = data.features?.[0]
    const center = feature?.center
    if (Array.isArray(center) && center.length >= 2) {
      return { lng: center[0], lat: center[1] }
    }
    return null
  } catch {
    return null
  }
}

export const FLY_TO_EVENT = "streetsafe-fly-to"

export function emitFlyTo(lng: number, lat: number) {
  window.dispatchEvent(
    new CustomEvent(FLY_TO_EVENT, { detail: { lng, lat } }),
  )
}
