import type { Report, Severity, IssueType, ReportStatus } from "@/types/report"

const issueTypes: IssueType[] = [
  "pothole",
  "broken streetlight",
  "illegal dumping",
  "road obstruction",
]

const severities: Severity[] = ["low", "medium", "high"]

const statuses: ReportStatus[] = ["open", "in_progress", "resolved"]

type ClusterConfig = {
  name: string
  latitude: number
  longitude: number
}

// Dashboard uses a slightly different distribution than the Toronto street-level view:
// more emphasis on downtown core and neighbouring cities (Scarborough, Mississauga, Brampton).
const dashboardClusters: ClusterConfig[] = [
  { name: "Downtown Core", latitude: 43.651, longitude: -79.383 },
  // Scarborough town centre
  { name: "Scarborough", latitude: 43.7764, longitude: -79.2318 },
  // Mississauga City Centre
  { name: "Mississauga", latitude: 43.589, longitude: -79.6441 },
  // Brampton downtown area
  { name: "Brampton", latitude: 43.7315, longitude: -79.7624 },
  // North York to hint at midtown spread
  { name: "North York", latitude: 43.7615, longitude: -79.4111 },
]

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function jitterCoordinate(value: number, maxOffset: number) {
  const offset = (Math.random() - 0.5) * maxOffset * 2
  return value + offset
}

// Mock reports for the dashboard only. TorontoPage continues to use torontoReports.
export const dashboardReports: Report[] = (() => {
  const reports: Report[] = []
  let idCounter = 1

  const reportsPerCluster = [18, 14, 10, 9, 9]

  dashboardClusters.forEach((cluster, index) => {
    const count = reportsPerCluster[index] ?? 10

    for (let i = 0; i < count; i++) {
      const severity = randomFrom(severities)

      reports.push({
        id: `dash-${cluster.name.toLowerCase().replace(" ", "-")}-${idCounter++}`,
        latitude: jitterCoordinate(cluster.latitude, 0.012),
        longitude: jitterCoordinate(cluster.longitude, 0.012),
        issue_type: randomFrom(issueTypes),
        severity,
        timestamp: new Date(
          Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: randomFrom(statuses),
      })
    }
  })

  return reports
})()

