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

const clusters: ClusterConfig[] = [
  { name: "Downtown", latitude: 43.6532, longitude: -79.3832 },
  { name: "Scarborough", latitude: 43.7764, longitude: -79.2318 },
  { name: "North York", latitude: 43.7615, longitude: -79.4111 },
  { name: "Etobicoke", latitude: 43.6205, longitude: -79.5132 },
  { name: "East York", latitude: 43.689, longitude: -79.335 },
]

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function jitterCoordinate(value: number, maxOffset: number) {
  const offset = (Math.random() - 0.5) * maxOffset * 2
  return value + offset
}

export const torontoReports: Report[] = (() => {
  const reports: Report[] = []
  let idCounter = 1

  const reportsPerCluster = [14, 12, 12, 11, 11]

  clusters.forEach((cluster, index) => {
    const count = reportsPerCluster[index] ?? 10

    for (let i = 0; i < count; i++) {
      const severity = randomFrom(severities)

      reports.push({
        id: `tor-${cluster.name.toLowerCase().replace(" ", "-")}-${idCounter++}`,
        latitude: jitterCoordinate(cluster.latitude, 0.01),
        longitude: jitterCoordinate(cluster.longitude, 0.01),
        issue_type: randomFrom(issueTypes),
        severity,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: randomFrom(statuses),
      })
    }
  })

  return reports
})()

