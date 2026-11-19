"use client"

import type React from "react"
import { useState, useMemo } from "react"
import type { VulnerabilityEntry } from "../types"
import { Shield, AlertTriangle, CheckCircle2, Clock, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"

const generateMockVulnerabilities = (): VulnerabilityEntry[] => {
  return [
    {
      id: 1,
      cveId: "CVE-2024-1234",
      severity: "Critical",
      title: "Remote Code Execution in Windows SMB Protocol",
      affectedSystem: "Windows Server 2019",
      discoveredDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: "Open",
      cvssScore: 9.8,
      description:
        "A critical vulnerability in the Windows SMB protocol allows remote attackers to execute arbitrary code without authentication.",
      remediation:
        "Apply Microsoft Security Update KB5034441. Disable SMBv1 protocol if not required. Implement network segmentation to limit SMB exposure.",
    },
    {
      id: 2,
      cveId: "CVE-2024-5678",
      severity: "High",
      title: "Privilege Escalation in Windows Task Scheduler",
      affectedSystem: "Windows 10/11",
      discoveredDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: "In Progress",
      cvssScore: 7.8,
      description: "Local attackers can exploit a flaw in the Windows Task Scheduler to gain SYSTEM privileges.",
      remediation:
        "Install the latest Windows cumulative update. Review and audit scheduled tasks. Apply principle of least privilege for user accounts.",
    },
    {
      id: 3,
      cveId: "CVE-2024-9012",
      severity: "High",
      title: "SQL Injection in Legacy Database Interface",
      affectedSystem: "Internal Web Application",
      discoveredDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: "Open",
      cvssScore: 8.1,
      description:
        "Multiple SQL injection vulnerabilities found in the legacy database interface allowing unauthorized data access.",
      remediation:
        "Implement parameterized queries. Update to latest framework version. Deploy Web Application Firewall (WAF) rules to block SQL injection attempts.",
    },
    {
      id: 4,
      cveId: "CVE-2024-3456",
      severity: "Medium",
      title: "Cross-Site Scripting (XSS) in Admin Panel",
      affectedSystem: "Admin Dashboard",
      discoveredDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: "Resolved",
      cvssScore: 6.1,
      description:
        "Stored XSS vulnerability in the admin panel comment section allows attackers to inject malicious scripts.",
      remediation:
        "Input validation and output encoding have been implemented. Content Security Policy (CSP) headers added.",
    },
    {
      id: 5,
      cveId: "CVE-2024-7890",
      severity: "Medium",
      title: "Weak Encryption in Legacy VPN Configuration",
      affectedSystem: "VPN Gateway",
      discoveredDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: "In Progress",
      cvssScore: 5.9,
      description:
        "VPN configuration uses outdated encryption protocols (3DES) that are vulnerable to cryptographic attacks.",
      remediation:
        "Upgrade VPN firmware to latest version. Configure to use AES-256-GCM encryption. Disable legacy cipher suites.",
    },
    {
      id: 6,
      cveId: "CVE-2024-2468",
      severity: "Low",
      title: "Information Disclosure in Error Messages",
      affectedSystem: "Web Server",
      discoveredDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: "Open",
      cvssScore: 3.7,
      description:
        "Verbose error messages expose sensitive system information including file paths and database structure.",
      remediation:
        "Configure custom error pages. Disable debug mode in production. Implement proper error logging without exposing details to users.",
    },
  ]
}

const SEVERITY_STYLES = {
  Critical: "bg-destructive/20 text-destructive border-destructive/30",
  High: "bg-warning/20 text-warning border-warning/30",
  Medium: "bg-primary/20 text-primary border-primary/30",
  Low: "bg-muted/40 text-muted-foreground border-muted",
}

const STATUS_STYLES = {
  Open: "bg-destructive/10 text-destructive",
  "In Progress": "bg-warning/10 text-warning",
  Resolved: "bg-success/10 text-success",
}

const STATUS_ICONS = {
  Open: AlertTriangle,
  "In Progress": Clock,
  Resolved: CheckCircle2,
}

const Remediation: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityEntry[]>(generateMockVulnerabilities())
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "In Progress" | "Resolved">("All")
  const [severityFilter, setSeverityFilter] = useState<"All" | "Critical" | "High" | "Medium" | "Low">("All")

  const handleMarkAsInProgress = (vulnId: number) => {
    setVulnerabilities(prev => 
      prev.map(vuln => 
        vuln.id === vulnId 
          ? { ...vuln, status: "In Progress" as const }
          : vuln
      )
    )
  }

  const handleViewCVEDetails = (cveId: string) => {
    // Open CVE details in NIST National Vulnerability Database
    const cveUrl = `https://nvd.nist.gov/vuln/detail/${cveId}`
    window.open(cveUrl, '_blank', 'noopener,noreferrer')
  }

  const filteredVulnerabilities = useMemo(() => {
    return vulnerabilities.filter((vuln) => {
      const statusMatch = statusFilter === "All" || vuln.status === statusFilter
      const severityMatch = severityFilter === "All" || vuln.severity === severityFilter
      return statusMatch && severityMatch
    })
  }, [vulnerabilities, statusFilter, severityFilter])

  const stats = useMemo(() => {
    return {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter((v) => v.severity === "Critical").length,
      open: vulnerabilities.filter((v) => v.status === "Open").length,
      resolved: vulnerabilities.filter((v) => v.status === "Resolved").length,
    }
  }, [vulnerabilities])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              Vulnerability Remediation Advisor
            </h1>
            <p className="text-muted-foreground mt-2">AI-powered recommendations for detected vulnerabilities</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Vulnerabilities</div>
            <div className="text-2xl font-bold text-foreground mt-1">{stats.total}</div>
          </div>
          <div className="bg-card border border-destructive/30 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Critical</div>
            <div className="text-2xl font-bold text-destructive mt-1">{stats.critical}</div>
          </div>
          <div className="bg-card border border-warning/30 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Open</div>
            <div className="text-2xl font-bold text-warning mt-1">{stats.open}</div>
          </div>
          <div className="bg-card border border-success/30 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Resolved</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.resolved}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
              {(["All", "Open", "In Progress", "Resolved"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === status ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Severity:</span>
            <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
              {(["All", "Critical", "High", "Medium", "Low"] as const).map((severity) => (
                <button
                  key={severity}
                  onClick={() => setSeverityFilter(severity)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    severityFilter === severity ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="space-y-3">
        {filteredVulnerabilities.map((vuln) => {
          const StatusIcon = STATUS_ICONS[vuln.status]
          const isExpanded = expandedId === vuln.id

          return (
            <div
              key={vuln.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : vuln.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${SEVERITY_STYLES[vuln.severity]}`}
                      >
                        {vuln.severity}
                      </span>
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[vuln.status]} flex items-center gap-1`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {vuln.status}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{vuln.cveId}</span>
                      <span className="text-xs text-muted-foreground">CVSS: {vuln.cvssScore}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{vuln.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Affected: {vuln.affectedSystem}</span>
                      <span>•</span>
                      <span>Discovered: {vuln.discoveredDate}</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border p-4 bg-muted/20 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{vuln.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      AI-Powered Remediation Steps
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed bg-primary/5 border border-primary/20 rounded-lg p-3">
                      {vuln.remediation}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleMarkAsInProgress(vuln.id)}
                      disabled={vuln.status === "In Progress" || vuln.status === "Resolved"}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        vuln.status === "In Progress" || vuln.status === "Resolved"
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {vuln.status === "In Progress" ? "In Progress" : vuln.status === "Resolved" ? "Resolved" : "Mark as In Progress"}
                    </button>
                    <button 
                      onClick={() => handleViewCVEDetails(vuln.cveId)}
                      className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      View CVE Details
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredVulnerabilities.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No vulnerabilities match your filters.</p>
        </div>
      )}
    </div>
  )
}

export default Remediation
