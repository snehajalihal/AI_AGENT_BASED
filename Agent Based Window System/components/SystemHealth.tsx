"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { SystemMetric, SecurityPosture } from "../types"
import { Activity, Cpu, HardDrive, Network, Shield, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const generateTimeSeriesData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${20 - i}m`,
    cpu: 30 + Math.random() * 40,
    memory: 50 + Math.random() * 30,
    network: 20 + Math.random() * 60,
  }))
}

const SystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: "CPU Usage", value: 45, unit: "%", status: "healthy", trend: "stable" },
    { name: "Memory Usage", value: 68, unit: "%", status: "warning", trend: "up" },
    { name: "Disk Usage", value: 72, unit: "%", status: "warning", trend: "up" },
    { name: "Network Traffic", value: 34, unit: "Mbps", status: "healthy", trend: "down" },
    { name: "Active Connections", value: 142, unit: "", status: "healthy", trend: "stable" },
    { name: "Failed Login Attempts", value: 3, unit: "", status: "healthy", trend: "down" },
  ])

  const [securityPosture, setSecurityPosture] = useState<SecurityPosture>({
    score: 87,
    level: "Good",
    lastScan: new Date().toLocaleString(),
    threatsBlocked: 1247,
    vulnerabilitiesFound: 4,
  })

  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData())

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
          trend: Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "stable",
        })),
      )

      setTimeSeriesData((prev) => {
        const newData = [
          ...prev.slice(1),
          {
            time: "now",
            cpu: 30 + Math.random() * 40,
            memory: 50 + Math.random() * 30,
            network: 20 + Math.random() * 60,
          },
        ]
        return newData
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: SystemMetric["status"]) => {
    switch (status) {
      case "healthy":
        return "text-success border-success/30 bg-success/10"
      case "warning":
        return "text-warning border-warning/30 bg-warning/10"
      case "critical":
        return "text-destructive border-destructive/30 bg-destructive/10"
    }
  }

  const getStatusIcon = (status: SystemMetric["status"]) => {
    switch (status) {
      case "healthy":
        return <Shield className="w-4 h-4" />
      case "warning":
        return <AlertCircle className="w-4 h-4" />
      case "critical":
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: SystemMetric["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-warning" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-success" />
      case "stable":
        return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getMetricIcon = (name: string) => {
    if (name.includes("CPU")) return <Cpu className="w-5 h-5" />
    if (name.includes("Memory") || name.includes("Disk")) return <HardDrive className="w-5 h-5" />
    if (name.includes("Network") || name.includes("Connection")) return <Network className="w-5 h-5" />
    return <Activity className="w-5 h-5" />
  }

  const getPostureColor = (level: SecurityPosture["level"]) => {
    switch (level) {
      case "Excellent":
        return "text-success"
      case "Good":
        return "text-primary"
      case "Fair":
        return "text-warning"
      case "Poor":
        return "text-destructive"
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            System Health Monitor
          </h1>
          <p className="text-muted-foreground mt-2">Real-time system metrics and security posture</p>
        </div>
      </div>

      {/* Security Posture Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Security Posture
          </h2>
          <span className="text-xs text-muted-foreground">Last scan: {securityPosture.lastScan}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - securityPosture.score / 100)}`}
                  className="text-primary transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{securityPosture.score}</span>
                <span className="text-xs text-muted-foreground">Score</span>
              </div>
            </div>
            <div className={`mt-2 text-lg font-semibold ${getPostureColor(securityPosture.level)}`}>
              {securityPosture.level}
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Threats Blocked (24h)</div>
              <div className="text-2xl font-bold text-success">{securityPosture.threatsBlocked.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Active Vulnerabilities</div>
              <div className="text-2xl font-bold text-warning">{securityPosture.vulnerabilitiesFound}</div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">System Resource Trends</h3>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(6, 182, 212)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(6, 182, 212)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                  labelStyle={{ color: "#d1d5db" }}
                />
                <Area type="monotone" dataKey="cpu" stroke="rgb(6, 182, 212)" fill="url(#colorCpu)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">{getMetricIcon(metric.name)}</div>
                <div>
                  <div className="text-sm text-muted-foreground">{metric.name}</div>
                  <div className="text-2xl font-bold text-foreground">
                    {typeof metric.value === "number" ? metric.value.toFixed(0) : metric.value}
                    <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
                  </div>
                </div>
              </div>
              {getTrendIcon(metric.trend)}
            </div>

            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(metric.status)}`}
              >
                {getStatusIcon(metric.status)}
                <span className="capitalize">{metric.status}</span>
              </div>

              {metric.unit === "%" && (
                <div className="flex-1 ml-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        metric.status === "healthy"
                          ? "bg-success"
                          : metric.status === "warning"
                            ? "bg-warning"
                            : "bg-destructive"
                      }`}
                      style={{ width: `${Math.min(100, metric.value)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Charts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Real-time Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" tick={{ fill: "#9ca3af" }} />
            <YAxis tick={{ fill: "#9ca3af" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
              labelStyle={{ color: "#d1d5db" }}
            />
            <Line type="monotone" dataKey="cpu" stroke="rgb(6, 182, 212)" strokeWidth={2} dot={false} name="CPU %" />
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
              dataKey="network"
              stroke="rgb(16, 185, 129)"
              strokeWidth={2}
              dot={false}
              name="Network Mbps"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SystemHealth
