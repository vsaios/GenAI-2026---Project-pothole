/**
 * Map token for Mapbox. Use VITE_MAPBOX_TOKEN in .env, or a default dev token for local runs.
 * App shows a friendly "Map loading..." state when the map is unavailable (e.g. no token).
 */
const DEFAULT_DEV_TOKEN = ""

export const MAPBOX_TOKEN =
  (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined) || DEFAULT_DEV_TOKEN

/** Backend API base URL for reports. In dev, uses proxy so leave empty or use "" to hit same origin. */
export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.DEV ? "" : "http://localhost:8000")

/** Geoapify API key for reverse geocoding (lat/lng → address). Get one at https://www.geoapify.com/ */
export const GEOAPIFY_API_KEY =
  (import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined) || ""
