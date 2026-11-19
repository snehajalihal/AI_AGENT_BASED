export type Page =
  | "Home"
  | "Train"
  | "Predict"
  | "Update"
  | "Vote"
  | "Dashboard"
  | "Login"
  | "Register"
  | "About"
  | "Alerts"
  | "Remediation"
  | "SystemHealth"

export interface TrainingMetrics {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
}

export interface ModelWeight {
  name: string
  weight: number
}

export interface ConfusionMatrixData {
  actualNormal: { predictedNormal: number; predictedIntrusion: number }
  actualIntrusion: { predictedNormal: number; predictedIntrusion: number }
}

export interface TrainingResults {
  metrics: TrainingMetrics
  weights: ModelWeight[]
  confusionMatrix: ConfusionMatrixData
}

export interface ActivityLogEntry {
  id: number
  timestamp: string
  status: "Normal" | "Intrusion"
  sourceIp: string
}

export interface AlertEntry {
  id: number
  timestamp: string
  status: "Normal" | "Intrusion"
  severity: "Critical" | "High" | "Medium" | "Low" | "Info"
  sourceIp: string
  destIp: string
  protocol: "TCP" | "UDP" | "ICMP"
}

// New types for vulnerability remediation feature
export interface VulnerabilityEntry {
  id: number
  cveId: string
  severity: "Critical" | "High" | "Medium" | "Low"
  title: string
  affectedSystem: string
  discoveredDate: string
  status: "Open" | "In Progress" | "Resolved"
  cvssScore: number
  description: string
  remediation: string
}

// New types for system health monitoring feature
export interface SystemMetric {
  name: string
  value: number
  unit: string
  status: "healthy" | "warning" | "critical"
  trend: "up" | "down" | "stable"
}

export interface SecurityPosture {
  score: number
  level: "Excellent" | "Good" | "Fair" | "Poor"
  lastScan: string
  threatsBlocked: number
  vulnerabilitiesFound: number
}
