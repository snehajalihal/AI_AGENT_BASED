
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Activity,
  Cpu,
  HardDrive,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  CalendarClock,
} from "lucide-react"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type SystemData = {
  cpu_usage: number
  memory_usage: number
  memory_total_gb: number
  disk_usage: number
  disk_total_gb: number
}

type FirewallProfile = {
  name: string
  enabled: boolean | number
}

type DefenderData = {
  success: boolean
  antivirus_enabled?: boolean | null
  real_time_protection?: boolean | null
  antispyware_enabled?: boolean | null
  signature_last_updated?: string | null
  error?: string
}

type UpdateData = {
  success: boolean
  pending_count?: number
  updates?: {
    title: string
    severity: string | null
    reboot_required: boolean
  }[]
  error?: string
}

type SecurityAssessment = {
  success: boolean
  checks: {
    firewall: boolean
    defender: boolean
    windows_update: boolean
  }
  firewall: {
    success: boolean
    profiles?: FirewallProfile[]
    error?: string
  }
  defender: DefenderData
  windows_update: UpdateData
  assessment_summary: {
    total_checks: number
    passed_checks: number
    failed_checks: number
  }
}

type MetricStatus = "healthy" | "warning" | "critical"
type Trend = "up" | "down" | "stable"

type ChartPoint = {
  time: string
  cpu: number
  memory: number
  disk: number
}

const API_URL = "http://127.0.0.1:8000"

const getStatus = (value: number): MetricStatus => {
  if (value >= 90) return "critical"
  if (value >= 70) return "warning"
  return "healthy"
}

const SystemHealth: React.FC = () => {
  const [systemData, setSystemData] = useState<SystemData | null>(null)
  const [previousData, setPreviousData] = useState<SystemData | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])

  const [security, setSecurity] =
    useState<SecurityAssessment | null>(null)

  const [error, setError] = useState("")
  const [securityError, setSecurityError] = useState("")
  const [loading, setLoading] = useState(true)
  const [securityLoading, setSecurityLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState("")
  const [securityUpdated, setSecurityUpdated] = useState("")

  const previousRef = useRef<SystemData | null>(null)

  // Fetch live system metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/system/metrics`)

      if (!response.ok) {
        throw new Error("Unable to fetch system metrics")
      }

      const data: SystemData = await response.json()

      setPreviousData(previousRef.current)
      previousRef.current = data

      setSystemData(data)
      setError("")
      setLoading(false)
      setLastUpdated(new Date().toLocaleTimeString())

      setChartData((previous) => [
        ...previous.slice(-19),
        {
          time: new Date().toLocaleTimeString(),
          cpu: data.cpu_usage,
          memory: data.memory_usage,
          disk: data.disk_usage,
        },
      ])
    } catch {
      setError(
        "Could not connect to the backend. Make sure FastAPI is running."
      )
      setLoading(false)
    }
  }, [])

  // Fetch Windows security assessment
  const fetchSecurity = useCallback(async () => {
    setSecurityLoading(true)
    setSecurityError("")

    try {
      const response = await fetch(
        `${API_URL}/api/security/assessment`
      )

      if (!response.ok) {
        throw new Error("Unable to fetch security assessment")
      }

      const data: SecurityAssessment = await response.json()

      if (!data.success) {
        throw new Error("Security assessment was unsuccessful")
      }

      setSecurity(data)
      setSecurityUpdated(new Date().toLocaleTimeString())
    } catch {
      setSecurityError(
        "Could not retrieve Windows security information. Check that FastAPI is running."
      )
    } finally {
      setSecurityLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialFetch = async () => {
      await fetchMetrics()

      if (isMounted) {
        fetchSecurity()
      }
    }

    initialFetch()

    const interval = setInterval(() => {
      if (isMounted) fetchMetrics()
    }, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [fetchMetrics, fetchSecurity])

  const getTrend = (current: number, previous?: number): Trend => {
    if (previous === undefined || previous === null) return "stable"
    if (current > previous + 1) return "up"
    if (current < previous - 1) return "down"
    return "stable"
  }

  const getStatusColor = (status: MetricStatus) => {
    switch (status) {
      case "healthy":
        return "text-success border-success/30 bg-success/10"
      case "warning":
        return "text-warning border-warning/30 bg-warning/10"
      case "critical":
        return "text-destructive border-destructive/30 bg-destructive/10"
    }
  }

  const getTrendIcon = (trend: Trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-warning" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-success" />
      case "stable":
        return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  const metrics = systemData
    ? [
        {
          name: "CPU Usage",
          value: systemData.cpu_usage,
          unit: "%",
          status: getStatus(systemData.cpu_usage),
          trend: getTrend(systemData.cpu_usage, previousData?.cpu_usage),
          icon: <Cpu className="w-5 h-5" />,
        },
        {
          name: "Memory Usage",
          value: systemData.memory_usage,
          unit: "%",
          status: getStatus(systemData.memory_usage),
          trend: getTrend(
            systemData.memory_usage,
            previousData?.memory_usage
          ),
          icon: <HardDrive className="w-5 h-5" />,
        },
        {
          name: "Disk Usage",
          value: systemData.disk_usage,
          unit: "%",
          status: getStatus(systemData.disk_usage),
          trend: getTrend(systemData.disk_usage, previousData?.disk_usage),
          icon: <HardDrive className="w-5 h-5" />,
        },
      ]
    : []

  const StatusIndicator = ({
    enabled,
    label,
  }: {
    enabled: boolean | null | undefined
    label: string
  }) => (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {enabled === true ? (
        <span className="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 className="w-4 h-4" />
          Enabled
        </span>
      ) : enabled === false ? (
        <span className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          Disabled
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">Unavailable</span>
      )}
    </div>
  )

  const firewallProfiles = security?.firewall?.profiles ?? []
  const pendingUpdates = security?.windows_update?.updates ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            System Health Monitor
          </h1>
          <p className="text-muted-foreground mt-2">
            Live system metrics and Windows security assessment
          </p>
        </div>

        <button
          onClick={fetchSecurity}
          disabled={securityLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${securityLoading ? "animate-spin" : ""}`}
          />
          Refresh Security
        </button>
      </div>

      {/* System API error */}
      {error && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      {/* Security API error */}
      {securityError && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
          {securityError}
        </div>
      )}

      {/* Loading */}
      {loading && !systemData && (
        <div className="bg-card border border-border rounded-lg p-6">
          Connecting to the system metrics API...
        </div>
      )}

      {systemData && (
        <>
          {/* System overview */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Live System Overview
              </h2>
              <span className="text-xs text-muted-foreground">
                Last updated: {lastUpdated}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-muted-foreground">
                  Total RAM
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {systemData.memory_total_gb} GB
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">
                  C: Drive Capacity
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {systemData.disk_total_gb} GB
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">
                  Data Source
                </div>
                <div className="text-2xl font-bold text-success">
                  Windows API
                </div>
              </div>
            </div>
          </div>

          {/* CPU, memory and disk cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.name}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {metric.icon}
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">
                        {metric.name}
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {metric.value.toFixed(1)}
                        <span className="text-sm text-muted-foreground ml-1">
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {getTrendIcon(metric.trend)}
                </div>

                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(metric.status)}`}
                  >
                    {metric.status === "healthy" ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="capitalize">{metric.status}</span>
                  </div>

                  <div className="flex-1 ml-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${Math.min(100, metric.value)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Real-time System Performance
            </h2>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="time" tick={{ fill: "#9ca3af" }} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#9ca3af" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#d1d5db" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    stroke="rgb(6, 182, 212)"
                    strokeWidth={2}
                    dot={false}
                    name="CPU %"
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    stroke="rgb(139, 92, 246)"
                    strokeWidth={2}
                    dot={false}
                    name="Memory %"
                  />
                  <Line
                    type="monotone"
                    dataKey="disk"
                    stroke="rgb(16, 185, 129)"
                    strokeWidth={2}
                    dot={false}
                    name="Disk %"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">
                Collecting the first readings...
              </p>
            )}
          </div>
        </>
      )}

      {/* Windows Security Assessment */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Windows Security Assessment
              </h2>
              <p className="text-sm text-muted-foreground">
                Results collected from Windows security services
              </p>
            </div>
          </div>

          {securityUpdated && (
            <span className="text-xs text-muted-foreground">
              Checked: {securityUpdated}
            </span>
          )}
        </div>

        {securityLoading && !security && (
          <p className="text-muted-foreground">
            Collecting Windows security information...
          </p>
        )}

        {security && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">
                  Checks executed
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {security.assessment_summary.total_checks}
                </p>
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">
                  Passed conditions
                </p>
                <p className="text-3xl font-bold text-success mt-1">
                  {security.assessment_summary.passed_checks}
                </p>
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">
                  Failed conditions
                </p>
                <p className="text-3xl font-bold text-destructive mt-1">
                  {security.assessment_summary.failed_checks}
                </p>
              </div>
            </div>

            {/* Firewall */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Windows Firewall
                </h3>
                <span className="text-xs text-muted-foreground">
                  {security.firewall.success
                    ? "Check successful"
                    : "Check failed"}
                </span>
              </div>

              {firewallProfiles.length > 0 ? (
                firewallProfiles.map((profile) => (
                  <StatusIndicator
                    key={profile.name}
                    label={`${profile.name} Profile`}
                    enabled={Boolean(profile.enabled)}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {security.firewall.error || "No firewall profile data available."}
                </p>
              )}
            </div>

            {/* Defender */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Microsoft Defender
                </h3>
                <span className="text-xs text-muted-foreground">
                  {security.defender.success
                    ? "Check successful"
                    : "Check failed"}
                </span>
              </div>

              {security.defender.success ? (
                <>
                  <StatusIndicator
                    label="Antivirus"
                    enabled={security.defender.antivirus_enabled}
                  />
                  <StatusIndicator
                    label="Real-time protection"
                    enabled={security.defender.real_time_protection}
                  />
                  <StatusIndicator
                    label="Antispyware"
                    enabled={security.defender.antispyware_enabled}
                  />

                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Signature last updated
                    </p>
                    <p className="text-sm font-medium mt-1 break-all">
                      {security.defender.signature_last_updated
                        ? new Date(
                            security.defender.signature_last_updated
                          ).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Unavailable"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {security.defender.error ||
                    "Defender information is unavailable."}
                </p>
              )}
            </div>

            {/* Windows Update */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-primary" />
                  Windows Update
                </h3>
                <span className="text-xs text-muted-foreground">
                  {security.windows_update.success
                    ? "Query successful"
                    : "Query failed"}
                </span>
              </div>

              {security.windows_update.success ? (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {security.windows_update.pending_count ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Pending updates detected
                  </p>

                  {pendingUpdates.length > 0 ? (
                    <div className="space-y-2">
                      {pendingUpdates.map((update, index) => (
                        <div
                          key={`${update.title}-${index}`}
                          className="rounded-lg bg-muted/50 p-3"
                        >
                          <p className="text-sm font-medium">
                            {update.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Severity: {update.severity || "Not provided"}
                            {" · "}
                            Reboot required:{" "}
                            {update.reboot_required ? "Yes" : "No"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No pending updates were returned by the query.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {security.windows_update.error ||
                    "Windows Update information is unavailable."}
                </p>
              )}
            </div>
          </>
        )}

        {!security && !securityLoading && (
          <p className="text-sm text-muted-foreground">
            No security assessment data available yet. Use Refresh Security to retry.
          </p>
        )}
      </div>
    </div>
  )
}

export default SystemHealth
