
"use client"

import { useEffect, useState } from "react"
import {
  Activity,
  Cpu,
  HardDrive,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
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

type MetricStatus = "healthy" | "warning" | "critical"
type Trend = "up" | "down" | "stable"

type ChartPoint = {
  time: string
  cpu: number
  memory: number
  disk: number
}

const getStatus = (value: number): MetricStatus => {
  if (value >= 90) return "critical"
  if (value >= 70) return "warning"
  return "healthy"
}

const SystemHealth: React.FC = () => {
  const [systemData, setSystemData] = useState<SystemData | null>(null)
  const [previousData, setPreviousData] = useState<SystemData | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState("")

  useEffect(() => {
    let isMounted = true

    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/system/metrics"
        )

        if (!response.ok) {
          throw new Error("Unable to fetch system metrics")
        }

        const data: SystemData = await response.json()

        if (!isMounted) return

        setPreviousData((previous) => systemData ?? previous)
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
        if (isMounted) {
          setError(
            "Could not connect to the backend. Make sure FastAPI is running."
          )
          setLoading(false)
        }
      }
    }

    fetchMetrics()

    const interval = setInterval(fetchMetrics, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [systemData])

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
          trend: getTrend(systemData.memory_usage, previousData?.memory_usage),
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

  function getTrend(current: number, previous?: number): Trend {
    if (previous === undefined) return "stable"
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

  const getStatusIcon = (status: MetricStatus) => {
    if (status === "healthy") return <Shield className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            System Health Monitor
          </h1>
          <p className="text-muted-foreground mt-2">
            Live system metrics collected from your Windows machine
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
          {error}
        </div>
      )}

      {loading && !systemData && (
        <div className="bg-card border border-border rounded-lg p-6">
          Connecting to the system metrics API...
        </div>
      )}

      {systemData && (
        <>
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
                    {getStatusIcon(metric.status)}
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
    </div>
  )
}

export default SystemHealth
