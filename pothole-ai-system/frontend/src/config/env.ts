/**
 * Map token for Mapbox. Use VITE_MAPBOX_TOKEN in .env, or a default dev token for local runs.
 * App shows a friendly "Map loading..." state when the map is unavailable (e.g. no token).
 */
const DEFAULT_DEV_TOKEN = ""

export const MAPBOX_TOKEN =
  (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined) || DEFAULT_DEV_TOKEN
