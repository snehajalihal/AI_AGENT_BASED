
import React from "react"
import InfoCard from "./Card"
import { InfoIcon, CogIcon, CodeIcon } from "./icons/Icons"

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-100 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
          About SecureAI Scanner
        </h1>
        <p className="mt-3 text-xl text-gray-400 sm:mt-4">
          Windows System Vulnerability & Network Scanner
        </p>
      </div>

      <InfoCard title="Our Project" icon={<InfoIcon />}>
        <p className="text-gray-300">
          AI-Based Windows System Vulnerability & Network Scanner is a
          security assessment application designed to monitor system
          resources and identify basic Windows security issues. It
          collects system information and checks important security
          settings to help users understand the security status of
          their Windows computer.
        </p>
      </InfoCard>

      <InfoCard title="How It Works" icon={<CogIcon />}>
        <p className="text-gray-300 mb-4">
          The application collects system information and performs
          security checks using Windows security services. The
          collected results are displayed through a dashboard for
          easy monitoring and assessment.
        </p>

        <ul className="list-disc list-inside space-y-2 pl-2 text-gray-300">
          <li>
            <strong>System Monitoring:</strong> Displays CPU, memory
            and disk usage.
          </li>
          <li>
            <strong>Firewall Assessment:</strong> Checks the status
            of Windows Firewall profiles.
          </li>
          <li>
            <strong>Microsoft Defender:</strong> Checks antivirus,
            real-time protection and antispyware status.
          </li>
          <li>
            <strong>Windows Updates:</strong> Identifies pending
            Windows updates.
          </li>
          <li>
            <strong>Security Assessment:</strong> Classifies the
            security checks as passed or requiring attention.
          </li>
          <li>
            <strong>Scan History:</strong> Stores previous security
            scan results for reference.
          </li>
        </ul>
      </InfoCard>

      <InfoCard title="Technology Stack" icon={<CodeIcon />}>
        <p className="text-gray-300 mb-4">
          The application uses the following technologies for
          development and system monitoring:
        </p>

        <ul className="list-disc list-inside space-y-2 pl-2 text-gray-300">
          <li>
            <strong>Frontend:</strong> Next.js and React for building
            the user interface.
          </li>
          <li>
            <strong>Programming Language:</strong> TypeScript for
            frontend development and Python for backend development.
          </li>
          <li>
            <strong>Styling:</strong> Tailwind CSS for dashboard
            styling and responsive layouts.
          </li>
          <li>
            <strong>Backend:</strong> FastAPI for handling API
            requests and collecting system information.
          </li>
          <li>
            <strong>System Monitoring:</strong> Python psutil and
            Windows PowerShell for collecting system and security data.
          </li>
          <li>
            <strong>Database:</strong> SQLite for storing security
            scan history.
          </li>
          <li>
            <strong>Data Visualization:</strong> Recharts for
            displaying security assessment results.
          </li>
        </ul>
      </InfoCard>
    </div>
  )
}

export default About
