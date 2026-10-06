"use client"

import type React from "react"
import type { Page } from "../types"
import { InfoIcon, PlayIcon } from "./icons/Icons"

interface HomeProps {
  setPage: (page: Page) => void
}

const Home: React.FC<HomeProps> = ({ setPage }) => {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-96 h-96 bg-primary/30 rounded-full blur-3xl"></div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl mb-4 gradient-text relative z-10">
          AI-based Windows System Vulnerability and Network Scanner
        </h1>
        <p className="mt-6 text-xl text-muted-foreground sm:mt-8 relative z-10">
          Advanced Machine Learning for Real-time Threat Detection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card-hover p-8 rounded-2xl group">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
              <InfoIcon />
            </div>
            <h2 className="text-2xl font-bold text-foreground">About the System</h2>
          </div>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            This Intrusion Detection System (IDS) uses an ensemble of machine learning models with incremental majority
            voting to detect network intrusions.
          </p>
          <p className="mb-3 text-foreground font-semibold">The system combines multiple models:</p>
          <ul className="list-disc list-inside mb-6 space-y-2 pl-2 text-muted-foreground">
            <li>Random Forest Classifier</li>
            <li>Gradient Boosting Classifier</li>
            <li>Support Vector Machine</li>
          </ul>
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
            <p className="font-semibold text-accent mb-2">New feature: User voting for models!</p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-muted-foreground text-sm">
              <li>Users can now vote for their preferred machine learning models.</li>
              <li>The model with the most votes will be used for predictions.</li>
              <li>
                Visit the{" "}
                <button
                  onClick={() => setPage("Vote")}
                  className="text-primary hover:text-accent hover:underline font-semibold transition-colors"
                >
                  Vote page
                </button>{" "}
                to cast your vote.
              </li>
            </ul>
          </div>
        </div>
        <div className="glass-card-hover p-8 rounded-2xl group">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-secondary/20 rounded-xl group-hover:bg-secondary/30 transition-colors">
              <PlayIcon />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Get Started</h2>
          </div>
          <p className="mb-6 text-muted-foreground leading-relaxed">Follow these steps to use the IDS system:</p>
          <ol className="list-decimal list-inside space-y-3 pl-2 text-muted-foreground mb-8">
            <li>Train the ensemble models with sample network data.</li>
            <li>Vote for your preferred machine learning algorithm.</li>
            <li>Make predictions on new network traffic.</li>
            <li>Update the model weights incrementally.</li>
            <li>View performance metrics on the dashboard.</li>
          </ol>
          <div className="mt-auto">
            <button
              onClick={() => setPage("Dashboard")}
              className="w-full bg-gradient-to-r from-secondary via-purple-600 to-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 glow-secondary transition-all duration-300"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
