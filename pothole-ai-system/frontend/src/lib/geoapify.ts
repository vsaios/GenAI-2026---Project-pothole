import { GEOAPIFY_API_KEY } from "@/config/env"

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  if (!GEOAPIFY_API_KEY) {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`
  }
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`
  const res = await fetch(url)
  if (!res.ok) return `${lat.toFixed(6)}, ${lon.toFixed(6)}`
  const data = await res.json()
  const f = data.features?.[0]
  const props = f?.properties
  if (!props) return `${lat.toFixed(6)}, ${lon.toFixed(6)}`
  return props.formatted || props.address_line1 || props.street || `${lat.toFixed(6)}, ${lon.toFixed(6)}`
}
