"use client"

import type React from "react"
import type { Page } from "../types"
import {
  Shield,
  Activity,
  AlertTriangle,
  Settings,
  BarChart3,
  Upload,
  TrendingUp,
  Home,
  Info,
  LogOut,
  Wrench,
  Heart,
} from "lucide-react"

interface NavbarProps {
  activePage: Page
  setActivePage: (page: Page) => void
  isAuthenticated: boolean
  onLogout: () => void
}

const NavItem: React.FC<{
  page: Page
  activePage: Page
  setActivePage: (page: Page) => void
  icon: React.ReactNode
  children: React.ReactNode
}> = ({ page, activePage, setActivePage, icon, children }) => {
  const isActive = activePage === page
  return (
    <button
      onClick={() => setActivePage(page)}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-card"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage, isAuthenticated, onLogout }) => {
  return (
    <header className="bg-card/50 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-border">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SecureAI Scanner</h1>
              <p className="text-xs text-muted-foreground">Vulnerability & Network Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NavItem
                  page="Dashboard"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<BarChart3 className="w-4 h-4" />}
                >
                  Dashboard
                </NavItem>
                <NavItem
                  page="Alerts"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<AlertTriangle className="w-4 h-4" />}
                >
                  Alerts
                </NavItem>
                {/* <NavItem
                  page="Remediation"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<Wrench className="w-4 h-4" />}
                >
                  Remediation
                </NavItem> */}
                <NavItem
                  page="SystemHealth"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<Heart className="w-4 h-4" />}
                >
                  System Health
                </NavItem>
                <NavItem
                  page="Train"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<Upload className="w-4 h-4" />}
                >
                  Train
                </NavItem>
                <NavItem
                  page="Predict"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<Activity className="w-4 h-4" />}
                >
                  Predict
                </NavItem>
                <NavItem
                  page="Vote"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<TrendingUp className="w-4 h-4" />}
                >
                  Vote
                </NavItem>
                <NavItem
                  page="Update"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<Settings className="w-4 h-4" />}
                >
                  Settings
                </NavItem>
                <NavItem
                  page="About"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<Info className="w-4 h-4" />}
                >
                  About
                </NavItem>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavItem
                  page="Home"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<Home className="w-4 h-4" />}
                >
                  Home
                </NavItem>
                <NavItem
                  page="About"
                  activePage={activePage}
                  setActivePage={setActivePage}
                  icon={<Info className="w-4 h-4" />}
                >
                  About
                </NavItem>
                <button
                  onClick={() => setActivePage("Login")}
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
