import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ReportLocationMap } from "@/components/ReportLocationMap"
import { useReports } from "@/context/ReportsContext"

const ISSUE_TYPES = [
  "pothole",
  "broken streetlight",
  "illegal dumping",
  "road obstruction",
]

const SEVERITIES = ["low", "medium", "high"]

const DEFAULT_LAT = 43.6532
const DEFAULT_LNG = -79.3832

export function Report() {
  const navigate = useNavigate()
  const { submitReport } = useReports()
  const [latitude, setLatitude] = useState(DEFAULT_LAT)
  const [longitude, setLongitude] = useState(DEFAULT_LNG)
  const [issueType, setIssueType] = useState("pothole")
  const [severity, setSeverity] = useState("medium")
  const [sendEmail, setSendEmail] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleLocationChange = (lat, lng) => {
    setLatitude(lat)
    setLongitude(lng)
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      return
    }
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
      },
      () => setError("Could not get your location. Enter coordinates manually.")
    )
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await submitReport({
        latitude,
        longitude,
        issue_type: issueType,
        severity,
        send_email: sendEmail,
        image: imageFile,
      })
      navigate("/toronto")
    } catch (err) {
      setError(err.message || "Failed to submit report")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Report an incident</h2>
        <p className="mt-1 text-sm text-slate-400">
          Click on the map to set the location, or enter coordinates manually. Your report
          will appear as a blue dot on the Toronto map.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Location */}
        <section className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">Location</label>
          <ReportLocationMap
            lat={latitude}
            lng={longitude}
            onLocationChange={handleLocationChange}
          />
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Lat</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Lng</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleUseLocation}
              className="rounded bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-600"
            >
              Use my location
            </button>
          </div>
        </section>

        {/* Issue type */}
        <section className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">Issue type</label>
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          >
            {ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("-", " ")}
              </option>
            ))}
          </select>
        </section>

        {/* Severity */}
        <section className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </section>

        {/* Image upload (optional) */}
        <section className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Photo <span className="text-slate-500">(optional)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-slate-400 file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-200 hover:file:bg-slate-600"
          />
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-1 h-32 rounded-lg border border-slate-700 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white hover:bg-red-400"
              >
                x
              </button>
            </div>
          )}
        </section>

        {/* Send email toggle */}
        <section className="flex items-center gap-3">
          <input
            id="send-email"
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="send-email" className="text-sm text-slate-200">
            Send report to 311 Toronto via email
          </label>
        </section>

        {error && (
          <p className="rounded bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit report"}
        </button>
      </form>
    </main>
  )
}
