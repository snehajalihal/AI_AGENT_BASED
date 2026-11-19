"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import type { ActivityLogEntry } from "../types"

const initialConfusionData = [
  { name: "Normal", "Predicted: Normal": 435, "Predicted: Intrusion": 15 },
  { name: "Intrusion", "Predicted: Normal": 22, "Predicted: Intrusion": 58 },
]

const initialDistributionData = [
  { name: "Normal", count: 494 },
  { name: "Intrusion", count: 4 },
]

const generateMockIp = () => `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`

const generateActivityLogs = (count: number): ActivityLogEntry[] => {
  return Array.from({ length: count }, (_, i) => {
    const isIntrusion = Math.random() < 0.2
    return {
      id: Date.now() + i,
      timestamp: new Date(Date.now() - i * 60000).toLocaleTimeString(),
      status: isIntrusion ? "Intrusion" : "Normal",
      sourceIp: generateMockIp(),
    }
  })
}

const Dashboard: React.FC = () => {
  const [confusionData, setConfusionData] = useState(initialConfusionData)
  const [distributionData, setDistributionData] = useState(initialDistributionData)
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])

  useEffect(() => {
    setActivityLog(generateActivityLogs(5))
  }, [])

  const handleAnalyze = useCallback(() => {
    // Mock data refresh
    setConfusionData((prev) =>
      prev.map((d) => ({
        ...d,
        "Predicted: Normal": d["Predicted: Normal"] + Math.floor(Math.random() * 20 - 10),
        "Predicted: Intrusion": d["Predicted: Intrusion"] + Math.floor(Math.random() * 10 - 5),
      })),
    )
    setDistributionData((prev) =>
      prev.map((d) => ({
        ...d,
        count: Math.max(0, d.count + Math.floor(Math.random() * 50 - 25)),
      })),
    )
    // Add new activity
    const newLogs = generateActivityLogs(Math.ceil(Math.random() * 3))
    setActivityLog((prev) => [...newLogs, ...prev].slice(0, 10))
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
        <button
          onClick={handleAnalyze}
          className="px-6 py-3 bg-gradient-to-r from-primary via-cyan-500 to-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 glow-primary transition-all duration-300"
        >
          Analyze Network
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="glass-card p-8 rounded-2xl glow-primary">
            <h3 className="text-2xl font-bold mb-6 text-center gradient-text">Confusion Matrix</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confusionData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.2)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#d1d5db" }}
                  label={{ value: "Actual Label", position: "insideBottom", offset: -10, fill: "#d1d5db" }}
                />
                <YAxis
                  tick={{ fill: "#d1d5db" }}
                  label={{ value: "Count", angle: -90, position: "insideLeft", fill: "#d1d5db" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.95)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderRadius: "0.75rem",
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Legend wrapperStyle={{ color: "#d1d5db" }} verticalAlign="top" />
                <Bar dataKey="Predicted: Normal" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Predicted: Intrusion" fill="#f43f5e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-8 rounded-2xl glow-secondary">
            <h3 className="text-2xl font-bold mb-6 text-center gradient-text">Detection Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.2)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#d1d5db" }}
                  label={{ value: "Class", position: "insideBottom", offset: -10, fill: "#d1d5db" }}
                />
                <YAxis
                  tick={{ fill: "#d1d5db" }}
                  label={{ value: "Detection Count", angle: -90, position: "insideLeft", fill: "#d1d5db" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.95)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "0.75rem",
                    backdropFilter: "blur(12px)",
                  }}
                  formatter={(value) => [value, "Detection Count"]}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Normal" ? "#10b981" : "#f43f5e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 glass-card p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-6 gradient-text">Recent Detections</h3>
          <ul className="space-y-4">
            {activityLog.map((log) => (
              <li
                key={log.id}
                className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 flex justify-between items-center group hover:scale-[1.02]"
              >
                <div>
                  <p
                    className={`font-semibold text-lg ${log.status === "Intrusion" ? "text-destructive" : "text-success"}`}
                  >
                    {log.status}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">{log.sourceIp}</p>
                </div>
                <p className="text-xs text-muted-foreground">{log.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
