import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { fetchReports, createReport } from "@/lib/api"

const ReportsContext = createContext(null)

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchReports()
      setReports(data)
    } catch (e) {
      setError(e.message)
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [])

  const addReport = useCallback((report) => {
    setReports((prev) => [report, ...prev])
  }, [])

  const submitReport = useCallback(async (payload) => {
    const report = await createReport(payload)
    addReport(report)
    return report
  }, [addReport])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  return (
    <ReportsContext.Provider
      value={{ reports, loading, error, loadReports, addReport, submitReport }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) throw new Error("useReports must be used within ReportsProvider")
  return ctx
}
