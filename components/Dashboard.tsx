
"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const API = "http://127.0.0.1:8000"

interface SystemMetrics {
  cpu_usage: number
  memory_usage: number
  memory_total_gb: number
  disk_usage: number
  disk_total_gb: number
}

interface MLPrediction {
  success: boolean
  model?: string
  predicted_risk?: string | null
  message?: string
  error?: string
  input_features?: {
    firewall_enabled: number
    defender_enabled: number
    updates_pending: number
    cpu_usage: number
    memory_usage: number
  }
}

interface Assessment {
  success: boolean
  scan_id?: number
  scan_time?: string

  checks: {
    firewall: boolean
    defender: boolean
    windows_update: boolean
  }

  firewall: {
    success: boolean
    all_enabled?: boolean
    profiles?: { name: string; enabled: boolean | number }[]
  }

  defender: {
    success: boolean
    antivirus_enabled?: boolean
    real_time_protection?: boolean
    antispyware_enabled?: boolean
    signature_last_updated?: string
  }

  windows_update: {
    success: boolean
    pending_count?: number
    updates?: {
      title: string
      severity: string | null
      reboot_required: boolean
    }[]
  }

  ml_prediction?: MLPrediction

  assessment_summary: {
    total_checks: number
    passed_checks: number
    failed_checks: number
  }
}

interface ScanHistoryItem {
  id: number
  scan_time: string
  total_checks: number
  passed_checks: number
  failed_checks: number
  assessment_data?: {
    ml_prediction?: MLPrediction
  }
}

interface NetworkDevice {
  ip_address: string
  mac_address: string
  status: number | string
  interface: string
}

interface NetworkDevicesResponse {
  success: boolean
  total_devices: number
  devices: NetworkDevice[]
  message: string
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [history, setHistory] = useState<ScanHistoryItem[]>([])
  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([])
  const [networkLoading, setNetworkLoading] = useState(true)
  const [networkError, setNetworkError] = useState("")

  const [loading, setLoading] = useState(true)
  const [scanLoading, setScanLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState("")

  const fetchNetworkDevices = useCallback(async () => {
    setNetworkLoading(true)
    setNetworkError("")

    try {
      const response = await fetch(`${API}/api/network/devices`)

      if (!response.ok) {
        throw new Error("Unable to retrieve local network devices.")
      }

      const data: NetworkDevicesResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Local network discovery failed.")
      }

      setNetworkDevices(data.devices ?? [])
    } catch (err) {
      setNetworkError(
        err instanceof Error
          ? err.message
          : "Could not retrieve local network devices."
      )
    } finally {
      setNetworkLoading(false)
    }
  }, [])

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError("")
    fetchNetworkDevices()

    try {
      const [metricsResponse, assessmentResponse, historyResponse] =
        await Promise.all([
          fetch(`${API}/api/system/metrics`),
          fetch(`${API}/api/security/assessment`),
          fetch(`${API}/api/security/history`),
        ])

      if (
        !metricsResponse.ok ||
        !assessmentResponse.ok ||
        !historyResponse.ok
      ) {
        throw new Error("Unable to retrieve dashboard data.")
      }

      const metricsData: SystemMetrics = await metricsResponse.json()
      const assessmentData: Assessment = await assessmentResponse.json()
      const historyData = await historyResponse.json()

      if (!assessmentData.success || !historyData.success) {
        throw new Error("Unable to retrieve security information.")
      }

      setMetrics(metricsData)
      setAssessment(assessmentData)
      setHistory(historyData.history ?? [])
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the backend."
      )
    } finally {
      setLoading(false)
    }
  }, [fetchNetworkDevices])

  const runSecurityScan = async () => {
    setScanLoading(true)
    setError("")

    try {
      const response = await fetch(`${API}/api/security/scan`, {
        method: "POST",
      })

      const data: Assessment = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.success === false
            ? "error" in data
              ? String(data.error)
              : "Security scan failed."
            : "Unable to complete security scan."
        )
      }

      setAssessment(data)

      const historyResponse = await fetch(`${API}/api/security/history`)

      if (!historyResponse.ok) {
        throw new Error("Scan completed, but history could not be refreshed.")
      }

      const historyData = await historyResponse.json()

      if (!historyData.success) {
        throw new Error("Scan completed, but history could not be refreshed.")
      }

      setHistory(historyData.history ?? [])
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not complete the security scan."
      )
    } finally {
      setScanLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const securityChecks = assessment
    ? [
        {
          name: "Firewall",
          passed: Boolean(
            assessment.firewall.success &&
            assessment.firewall.all_enabled
          ),
        },
        {
          name: "Microsoft Defender",
          passed: Boolean(
            assessment.defender.success &&
            assessment.defender.antivirus_enabled &&
            assessment.defender.real_time_protection &&
            assessment.defender.antispyware_enabled
          ),
        },
        {
          name: "Windows Updates",
          passed: Boolean(
            assessment.windows_update.success &&
            assessment.windows_update.pending_count === 0
          ),
        },
      ]
    : []

  const chartData = securityChecks.map((check) => ({
    name: check.name,
    status: check.passed ? 1 : 0,
  }))

  const getStatus = (passed: boolean) =>
    passed ? "Healthy" : "Needs attention"

  const getNetworkStatus = (status: number | string) => {
    const normalized = String(status).toLowerCase()

    if (normalized === "5" || normalized === "reachable") {
      return "Reachable"
    }

    if (normalized === "4" || normalized === "stale") {
      return "Stale"
    }

    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  const getNetworkStatusClass = (status: number | string) => {
    const normalized = String(status).toLowerCase()

    return normalized === "5" || normalized === "reachable"
      ? "text-emerald-400"
      : "text-orange-400"
  }

  const getStatusClass = (passed: boolean) =>
    passed
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : "text-orange-400 border-orange-500/30 bg-orange-500/10"

  const getRiskClass = (risk?: string | null) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      case "moderate":
        return "text-orange-400 border-orange-500/30 bg-orange-500/10"
      case "high":
        return "text-red-400 border-red-500/30 bg-red-500/10"
      default:
        return "text-muted-foreground border-border bg-background/50"
    }
  }

  const MetricCard = ({
    title,
    value,
    description,
  }: {
    title: string
    value: string
    description: string
  }) => (
    <div className="glass-card p-6 rounded-2xl">
      <p className="text-muted-foreground mb-3">{title}</p>
      <p className="text-4xl font-bold gradient-text">{value}</p>
      <p className="text-sm text-muted-foreground mt-3">{description}</p>
    </div>
  )

  const mlPrediction = assessment?.ml_prediction
  const mlFeatures = mlPrediction?.input_features

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Live Windows system metrics and security assessment
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading || scanLoading}
            className="px-5 py-3 border border-border rounded-xl font-semibold hover:bg-background/70 transition-all disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>

          <button
            onClick={runSecurityScan}
            disabled={scanLoading || loading}
            className="px-6 py-3 bg-gradient-to-r from-primary via-cyan-500 to-secondary text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {scanLoading ? "Scanning..." : "Run Security Scan"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400">
          {error}
          <p className="text-sm mt-1">
            Make sure your FastAPI backend is running on port 8000.
          </p>
        </div>
      )}

      {loading && !metrics && (
        <div className="glass-card p-8 rounded-2xl text-center text-muted-foreground">
          Loading live system data...
        </div>
      )}

      {metrics && (
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
            <h2 className="text-2xl font-bold">System Overview</h2>
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="CPU Usage"
              value={`${metrics.cpu_usage.toFixed(1)}%`}
              description="Current processor utilization"
            />
            <MetricCard
              title="Memory Usage"
              value={`${metrics.memory_usage.toFixed(1)}%`}
              description={`${metrics.memory_total_gb} GB total RAM`}
            />
            <MetricCard
              title="Disk Usage"
              value={`${metrics.disk_usage.toFixed(1)}%`}
              description={`${metrics.disk_total_gb} GB total C: drive`}
            />
          </div>
        </div>
      )}

      {/* LOCAL NETWORK DEVICES */}

      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Local Network Devices</h2>
            <p className="text-muted-foreground mt-1">
              Devices listed in the Windows IPv4 neighbor cache
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold gradient-text">
              {networkLoading ? "—" : networkDevices.length}
            </span>
            <button
              onClick={fetchNetworkDevices}
              disabled={networkLoading}
              className="px-4 py-2 border border-border rounded-xl font-semibold hover:bg-background/70 transition-all disabled:opacity-50"
            >
              {networkLoading ? "Refreshing..." : "Refresh Devices"}
            </button>
          </div>
        </div>

        {networkLoading ? (
          <p className="text-muted-foreground text-center py-6">
            Retrieving local network devices...
          </p>
        ) : networkError ? (
          <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/10">
            <p className="text-orange-400">{networkError}</p>
          </div>
        ) : networkDevices.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="py-3 pr-4 font-semibold">IP Address</th>
                    <th className="py-3 pr-4 font-semibold">MAC Address</th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                    <th className="py-3 font-semibold">Interface</th>
                  </tr>
                </thead>
                <tbody>
                  {networkDevices.map((device) => (
                    <tr
                      key={`${device.ip_address}-${device.mac_address}`}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="py-4 pr-4 font-medium">
                        {device.ip_address}
                      </td>
                      <td className="py-4 pr-4 font-mono text-muted-foreground">
                        {device.mac_address}
                      </td>
                      <td
                        className={`py-4 pr-4 font-semibold ${getNetworkStatusClass(device.status)}`}
                      >
                        {getNetworkStatus(device.status)}
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {device.interface}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Note: This list comes from the Windows neighbor cache. It may not
              include every device currently connected to the network.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-6">
            No devices were found in the Windows neighbor cache.
          </p>
        )}
      </div>

      {assessment && (
        <>
          {/* SECURITY ASSESSMENT */}

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  Windows Security Assessment
                </h2>
                <p className="text-muted-foreground mt-1">
                  Results collected from Windows security services
                </p>
              </div>

              <span className="text-sm text-muted-foreground">
                {assessment.assessment_summary.total_checks} checks performed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <MetricCard
                title="Checks Executed"
                value={String(assessment.assessment_summary.total_checks)}
                description="Security checks performed"
              />
              <MetricCard
                title="Passed Conditions"
                value={String(
                  securityChecks.filter((check) => check.passed).length
                )}
                description="Conditions meeting the checks"
              />
              <MetricCard
                title="Failed Conditions"
                value={String(
                  securityChecks.filter((check) => !check.passed).length
                )}
                description="Conditions requiring attention"
              />
            </div>

            <h3 className="text-xl font-semibold mb-5">
              Security Check Results
            </h3>

            <div className="space-y-4">
              {securityChecks.map((check) => (
                <div
                  key={check.name}
                  className="flex justify-between items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
                >
                  <span className="font-semibold">{check.name}</span>
                  <span
                    className={`px-4 py-2 rounded-full border text-sm font-semibold ${getStatusClass(check.passed)}`}
                  >
                    {getStatus(check.passed)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* MACHINE LEARNING PREDICTION */}

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  Machine Learning Risk Prediction
                </h2>
                <p className="text-muted-foreground mt-1">
                  Security risk classification using Random Forest
                </p>
              </div>

              <span className="text-sm px-3 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                Random Forest
              </span>
            </div>

            {mlPrediction?.success && mlPrediction.predicted_risk ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-background/50 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-3">
                      Predicted Security Risk
                    </p>

                    <p
                      className={`inline-block text-3xl font-bold px-5 py-3 rounded-xl border ${getRiskClass(mlPrediction.predicted_risk)}`}
                    >
                      {mlPrediction.predicted_risk} Risk
                    </p>

                    <p className="text-sm text-muted-foreground mt-4">
                      {mlPrediction.message}
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-background/50 border border-border/50">
                    <p className="font-semibold mb-3">
                      About this prediction
                    </p>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The Random Forest model evaluates firewall, Defender,
                      pending update, CPU, and memory information to classify
                      the system into a risk category.
                    </p>

                    <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                      This is an educational prototype trained on a synthetic,
                      rule-labelled dataset. Its prediction is not a validated
                      real-world threat assessment.
                    </p>
                  </div>
                </div>

                {/* MODEL INPUT FEATURES */}

                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Model Input Features
                  </h3>

                  <p className="text-sm text-muted-foreground mb-5">
                    The following system values were supplied to the Random
                    Forest model for this prediction.
                  </p>

                  {mlFeatures ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="p-5 rounded-xl bg-background/50 border border-border/50">
                        <p className="text-sm text-muted-foreground mb-2">
                          Firewall
                        </p>
                        <p className="text-2xl font-bold">
                          {mlFeatures.firewall_enabled === 1
                            ? "Enabled"
                            : "Disabled"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Input: {mlFeatures.firewall_enabled}
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-background/50 border border-border/50">
                        <p className="text-sm text-muted-foreground mb-2">
                          Microsoft Defender
                        </p>
                        <p className="text-2xl font-bold">
                          {mlFeatures.defender_enabled === 1
                            ? "Enabled"
                            : "Disabled"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Input: {mlFeatures.defender_enabled}
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-background/50 border border-border/50">
                        <p className="text-sm text-muted-foreground mb-2">
                          Pending Updates
                        </p>
                        <p className="text-2xl font-bold">
                          {mlFeatures.updates_pending}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Number of updates
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-background/50 border border-border/50">
                        <p className="text-sm text-muted-foreground mb-2">
                          CPU Usage
                        </p>
                        <p className="text-2xl font-bold">
                          {mlFeatures.cpu_usage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Current utilization
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-background/50 border border-border/50">
                        <p className="text-sm text-muted-foreground mb-2">
                          Memory Usage
                        </p>
                        <p className="text-2xl font-bold">
                          {mlFeatures.memory_usage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Current utilization
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-orange-400">
                      Input feature information is unavailable.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="p-5 rounded-xl bg-background/50 border border-border/50">
                <p className="text-orange-400 font-semibold">
                  ML prediction currently unavailable
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {mlPrediction?.message ??
                    "No machine learning prediction was returned by the backend."}
                </p>
              </div>
            )}
          </div>

          {/* SECURITY CHECK COMPARISON */}

          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Security Check Comparison
            </h2>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(6, 182, 212, 0.2)"
                />

                <XAxis dataKey="name" tick={{ fill: "#d1d5db" }} />

                <YAxis
                  domain={[0, 1]}
                  ticks={[0, 1]}
                  tickFormatter={(value) => value === 1 ? "Pass" : "Fail"}
                  tick={{ fill: "#d1d5db" }}
                />

                <Tooltip
                  formatter={(value) => [
                    Number(value) === 1 ? "Passed" : "Needs attention",
                    "Result",
                  ]}
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderRadius: "12px",
                  }}
                />

                <Bar dataKey="status" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.status === 1 ? "#10b981" : "#f97316"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* FIREWALL */}

          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Windows Firewall
            </h2>

            <div className="space-y-4">
              {assessment.firewall.profiles?.map((profile) => {
                const enabled =
                  profile.enabled === true || profile.enabled === 1

                return (
                  <div
                    key={profile.name}
                    className="flex justify-between items-center p-4 rounded-xl bg-background/50"
                  >
                    <span>{profile.name} Profile</span>
                    <span
                      className={
                        enabled ? "text-emerald-400" : "text-orange-400"
                      }
                    >
                      {enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* MICROSOFT DEFENDER */}

          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Microsoft Defender
            </h2>

            <div className="space-y-4">
              {[
                {
                  label: "Antivirus",
                  enabled: assessment.defender.antivirus_enabled,
                },
                {
                  label: "Real-time Protection",
                  enabled: assessment.defender.real_time_protection,
                },
                {
                  label: "Antispyware",
                  enabled: assessment.defender.antispyware_enabled,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center p-4 rounded-xl bg-background/50"
                >
                  <span>{item.label}</span>
                  <span
                    className={
                      item.enabled ? "text-emerald-400" : "text-orange-400"
                    }
                  >
                    {item.enabled ? "Enabled" : "Disabled / Unavailable"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Antivirus signature last updated
              </p>
              <p className="font-semibold mt-1">
                {assessment.defender.signature_last_updated
                  ? new Date(
                      assessment.defender.signature_last_updated
                    ).toLocaleString()
                  : "Unavailable"}
              </p>
            </div>
          </div>

          {/* WINDOWS UPDATES */}

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
              <h2 className="text-2xl font-bold">Windows Updates</h2>

              <span className="text-3xl font-bold gradient-text">
                {assessment.windows_update.success &&
                assessment.windows_update.pending_count != null
                  ? assessment.windows_update.pending_count
                  : "—"}
              </span>
            </div>

            {!assessment.windows_update.success ||
            assessment.windows_update.pending_count == null ? (
              <p className="text-orange-400">
                Windows Update information is currently unavailable.
              </p>
            ) : assessment.windows_update.pending_count === 0 ? (
              <p className="text-emerald-400">
                No pending updates reported.
              </p>
            ) : assessment.windows_update.updates?.length ? (
              <>
                <p className="text-orange-400 mb-5">
                  {assessment.windows_update.pending_count} pending updates
                  detected.
                </p>

                <div className="space-y-3">
                  {assessment.windows_update.updates.map((update, index) => (
                    <div
                      key={`${update.title}-${index}`}
                      className="p-4 rounded-xl bg-background/50 border border-border/50"
                    >
                      <p className="font-semibold">{update.title}</p>

                      <p className="text-sm text-muted-foreground mt-2">
                        Severity: {update.severity ?? "Not provided"} ·
                        Reboot required: {update.reboot_required ? "Yes" : "No"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-orange-400">
                {assessment.windows_update.pending_count} pending updates
                detected. Update details are unavailable.
              </p>
            )}
          </div>
        </>
      )}

      {/* SCAN HISTORY */}

      <div className="glass-card p-6 rounded-2xl">
        <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Scan History</h2>
            <p className="text-muted-foreground mt-1">
              Previously completed and saved security scans
            </p>
          </div>

          <span className="text-sm text-muted-foreground">
            {history.length} records
          </span>
        </div>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((scan) => (
              <div
                key={scan.id}
                className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
              >
                <div>
                  <p className="font-semibold">
                    Scan #{scan.id}
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(scan.scan_time).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-emerald-400">
                    Passed: {scan.passed_checks}
                  </span>

                  <span className="text-orange-400">
                    Failed: {scan.failed_checks}
                  </span>

                  <span className="text-muted-foreground">
                    Total: {scan.total_checks}
                  </span>

                  {(() => {
                    const prediction = scan.assessment_data?.ml_prediction

                    const risk = prediction?.success
                      ? prediction.predicted_risk
                      : null

                    return (
                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${getRiskClass(risk)}`}
                      >
                        ML Risk: {risk ?? "Not available"}
                      </span>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-6">
            No saved scans yet. Click Run Security Scan to create your first record.
          </p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
