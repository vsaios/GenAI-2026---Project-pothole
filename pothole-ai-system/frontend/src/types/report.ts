export type Severity = "low" | "medium" | "high"

export type IssueType =
  | "pothole"
  | "broken streetlight"
  | "illegal dumping"
  | "road obstruction"

export type ReportStatus = "open" | "in_progress" | "resolved"

export type Report = {
  id: string
  latitude: number
  longitude: number
  issue_type: IssueType
  severity: Severity
  timestamp: string
  status: ReportStatus
}

