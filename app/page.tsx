"use client"

import { useState, useCallback } from "react"
import Navbar from "@/components/Sidebar"
import Footer from "@/components/Header"
import Home from "@/components/Home"
import Train from "@/components/Upload"
import Update from "@/components/Settings"
import Predict from "@/components/LiveTrafficChart"
import Vote from "@/components/AttackTypePieChart"
import Dashboard from "@/components/Dashboard"
import Login from "@/components/Login"
import Register from "@/components/Register"
import About from "@/components/About"
import Alerts from "@/components/Alerts"
import Remediation from "@/components/Remediation"
import SystemHealth from "@/components/SystemHealth"
import type { Page } from "@/types"

export default function HomePage() {
  const [page, setPage] = useState<Page>("Login")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true)
    setPage("Dashboard")
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setPage("Login")
  }, [])

  const renderContent = useCallback(() => {
    switch (page) {
      case "Home":
        return <Home setPage={setPage} />
      case "Train":
        return isAuthenticated ? <Train /> : <Login setPage={setPage} onLogin={handleLogin} />
      case "Predict":
        return isAuthenticated ? <Predict /> : <Login setPage={setPage} onLogin={handleLogin} />
      case "Update":
        return isAuthenticated ? <Update setPage={setPage} /> : <Login setPage={setPage} onLogin={handleLogin} />
      case "Vote":
        return isAuthenticated ? <Vote /> : <Login setPage={setPage} onLogin={handleLogin} />
      case "Dashboard":
        return isAuthenticated ? <Dashboard /> : <Login setPage={setPage} onLogin={handleLogin} />
      case "Alerts":
        return isAuthenticated ? <Alerts /> : <Login setPage={setPage} onLogin={handleLogin} />
      case "Remediation":
        return isAuthenticated ? <Remediation /> : <Login setPage={setPage} onLogin={handleLogin} />
      case "SystemHealth":
        return isAuthenticated ? <SystemHealth /> : <Login setPage={setPage} onLogin={handleLogin} />
      case "Login":
        return isAuthenticated ? <Dashboard /> : <Login setPage={setPage} onLogin={handleLogin} />
      case "Register":
        return isAuthenticated ? <Dashboard /> : <Register setPage={setPage} onRegister={handleLogin} />
      case "About":
        return <About />
      default:
        return isAuthenticated ? <Dashboard /> : <Login setPage={setPage} onLogin={handleLogin} />
    }
  }, [page, isAuthenticated, handleLogin])

  const isAuthPage = page === "Login" || page === "Register"

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && (
        <Navbar activePage={page} setActivePage={setPage} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      )}
      <main
        className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isAuthPage ? "flex flex-col justify-center" : ""}`}
      >
        {renderContent()}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}
