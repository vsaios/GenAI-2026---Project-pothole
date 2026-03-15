/**
 * Chatbot → map navigation: extract location from chat, geocode, then move map
 * to road/intersection or to nearest incident node. No UI changes; hidden search only.
 */

import { torontoReports } from "@/mock/torontoReports"

const TORONTO_PROXIMITY = "-79.3832,43.6532"
const NEAREST_NODE_RADIUS_M = 300
const ZOOM_STREET = 15
const ZOOM_NODE = 16

/** Myhal Centre custom node (Toronto map) – include in incident list for node priority */
const MYHAL_COORDS = { lng: -79.396485, lat: 43.660837 }

/** Partial name (lowercase) -> full form for geocoder. Covers common Toronto streets. */
const TORONTO_STREET_NAMES: Record<string, string> = {
  yonge: "Yonge St",
  dundas: "Dundas St",
  bloor: "Bloor St W",
  queen: "Queen St W",
  king: "King St W",
  college: "College St",
  spadina: "Spadina Ave",
  bathurst: "Bathurst St",
  university: "University Ave",
  bay: "Bay St",
  church: "Church St",
  jarvis: "Jarvis St",
  sherbourne: "Sherbourne St",
  parliament: "Parliament St",
  front: "Front St",
  wellington: "Wellington St W",
  adelaide: "Adelaide St W",
  richmond: "Richmond St W",
  harbour: "Harbour St",
  john: "John St",
  peter: "Peter St",
  simcoe: "Simcoe St",
  york: "York St",
  victoria: "Victoria St",
  chestnut: "Chestnut St",
  gerrard: "Gerrard St",
  carleton: "Carleton St",
  gould: "Gould St",
  gordon: "Gordon St",
  mccaul: "McCaul St",
  brunswick: "Brunswick Ave",
  harbord: "Harbord St",
  stgeorge: "St George St",
  bedford: "Bedford Rd",
  avenue: "Avenue Rd",
  dufferin: "Dufferin St",
  ossington: "Ossington Ave",
  lansdowne: "Lansdowne Ave",
  roncesvalles: "Roncesvalles Ave",
  highpark: "High Park Blvd",
  jane: "Jane St",
  keele: "Keele St",
  weston: "Weston Rd",
  lawrence: "Lawrence Ave",
  eglinton: "Eglinton Ave",
  stclair: "St Clair Ave W",
  davisville: "Davisville Ave",
  mountpleasant: "Mount Pleasant Rd",
  bayview: "Bayview Ave",
  leslie: "Leslie St",
  donmills: "Don Mills Rd",
  victoriapark: "Victoria Park Ave",
  warden: "Warden Ave",
  kennedy: "Kennedy Rd",
  midland: "Midland Ave",
  brimley: "Brimley Rd",
  markham: "Markham Rd",
  neilson: "Neilson Rd",
  morningside: "Morningside Ave",
  kingston: "Kingston Rd",
  danforth: "Danforth Ave",
  broadview: "Broadview Ave",
  pape: "Pape Ave",
  woodbine: "Woodbine Ave",
  coxwell: "Coxwell Ave",
  greenwood: "Greenwood Ave",
  jones: "Jones Ave",
  wood: "Wood St",
}

/** Normalize: lowercase, trim, remove commas and periods for consistent search. */
function normalizeQuery(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Partial + case-insensitive: streetName.toLowerCase().includes(normalized) style.
 * "yonge", "yonge st", "yonge street" → "Yonge St".
 */
function expandPartialStreet(part: string): string {
  const raw = part.trim()
  const normalized = raw.toLowerCase().replace(/\s+/g, "")
  if (!normalized) return raw
  for (const [key, full] of Object.entries(TORONTO_STREET_NAMES)) {
    if (key.includes(normalized) || normalized.includes(key)) return full
  }
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw
}

/** Intersection separators: " and ", "&", "/" (with optional spaces). */
const INTERSECTION_REGEX = /\s+and\s+|\s*&\s*|\s*\/\s*/i

/** Split into two street names if intersection; otherwise null. */
function parseIntersection(normalized: string): string[] | null {
  const parts = normalized.split(INTERSECTION_REGEX).map((p) => p.trim()).filter(Boolean)
  return parts.length >= 2 ? parts : null
}

/** Build geocoder query: intersection "A and B, Toronto" or single "Street, Toronto, ON". */
function buildSearchQuery(normalized: string, isIntersection: boolean): string {
  if (isIntersection) {
    const parts = parseIntersection(normalized)!
    const expanded = parts.map(expandPartialStreet)
    return `${expanded[0]} and ${expanded[1]}, Toronto, ON`
  }
  const single = expandPartialStreet(normalized)
  return `${single}, Toronto, ON`
}

/** Haversine distance in meters. */
function distanceMeters(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function getIncidentCoordinates(): { lng: number; lat: number }[] {
  const fromReports = torontoReports.map((r) => ({ lng: r.longitude, lat: r.latitude }))
  return [...fromReports, MYHAL_COORDS]
}

/** Find nearest incident node within radius (meters). Returns coords and true if found. */
function findNearestNode(
  lng: number,
  lat: number,
  radiusM: number,
): { lng: number; lat: number } | null {
  const coords = getIncidentCoordinates()
  let nearest: { lng: number; lat: number } | null = null
  let minD = radiusM + 1
  for (const c of coords) {
    const d = distanceMeters(lng, lat, c.lng, c.lat)
    if (d < minD) {
      minD = d
      nearest = c
    }
  }
  return nearest
}

export async function geocodeToToronto(
  query: string,
  token: string,
): Promise<{ lng: number; lat: number } | null> {
  if (!query.trim() || !token) return null
  const q = encodeURIComponent(query.trim())
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

export type SearchLocationResult = { lng: number; lat: number; zoom?: number }

/**
 * Main handler for chat → map navigation. Does not change chatbot UI.
 *
 * Flow:
 * 1. Normalize (lowercase, trim, remove [.,]).
 * 2. Detect intersection (" and ", "&", "/").
 * 3. If intersection: geocode intersection → nodes within 300 m → go to node or intersection.
 * 4. If single road: geocode road (partial match) → nodes within 300 m → go to node or road.
 * 5. Failsafe: if geocode fails, try query + " toronto".
 */
export async function handleChatLocationSearch(
  query: string,
  token: string,
): Promise<SearchLocationResult | null> {
  console.log("Chat location query:", query)

  if (!query.trim() || !token) return null

  const normalized = normalizeQuery(query)
  if (!normalized) return null

  const isIntersection = parseIntersection(normalized) !== null
  let searchQuery = buildSearchQuery(normalized, isIntersection)

  let coords = await geocodeToToronto(searchQuery, token)

  if (!coords) {
    const fallbackQuery = `${normalized} toronto`
    coords = await geocodeToToronto(fallbackQuery, token)
  }
  if (!coords) return null

  const nearest = findNearestNode(coords.lng, coords.lat, NEAREST_NODE_RADIUS_M)
  if (nearest) {
    return { lng: nearest.lng, lat: nearest.lat, zoom: ZOOM_NODE }
  }
  return { lng: coords.lng, lat: coords.lat, zoom: ZOOM_STREET }
}

/** Alias for backwards compatibility. */
export const searchLocationFromChat = handleChatLocationSearch

export const FLY_TO_EVENT = "streetsafe-fly-to"

export function emitFlyTo(lng: number, lat: number, zoom?: number) {
  window.dispatchEvent(
    new CustomEvent(FLY_TO_EVENT, { detail: { lng, lat, zoom } }),
  )
}
