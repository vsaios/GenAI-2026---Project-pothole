import type { Report } from "@/types/report"
import { API_URL } from "@/config/env"

const base = API_URL || (typeof window !== "undefined" ? window.location.origin : "")

export type ReportCreatePayload = {
  latitude: number
  longitude: number
  issue_type: string
  severity: string
  send_email?: boolean
  image?: File | null
}

export async function fetchReports(): Promise<Report[]> {
  const res = await fetch(`${base}/api/reports`)
  if (!res.ok) {
    throw new Error(`Failed to fetch reports: ${res.status}`)
  }
  return res.json()
}

export async function createReport(payload: ReportCreatePayload): Promise<Report> {
  const form = new FormData()
  form.append("latitude", String(payload.latitude))
  form.append("longitude", String(payload.longitude))
  form.append("issue_type", payload.issue_type)
  form.append("severity", payload.severity)
  form.append("send_email", String(payload.send_email ?? false))
  if (payload.image) {
    form.append("image", payload.image)
  }

  const res = await fetch(`${base}/api/reports`, {
    method: "POST",
    body: form,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Failed to create report: ${res.status}`)
  }
  return res.json()
}
