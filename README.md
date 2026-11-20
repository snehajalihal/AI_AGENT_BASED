AI-Based Windows System Vulnerability & Network Scanner
A Windows-focused system monitoring and security assessment prototype
built with Python, FastAPI, Next.js, React, TypeScript, and Machine
Learning.

The application collects selected Windows security settings, displays
system resource usage, discovers devices already listed in the Windows
IPv4 neighbor cache, and stores security scan history.
Project scope: This is an educational prototype. It is not a
complete vulnerability scanner, endpoint protection product, or
validated real-world threat detection system.

Features
- System Monitoring -- Displays CPU, memory, and disk usage.
- Windows Firewall Assessment -- Checks the status of Windows
  Firewall profiles.
- Microsoft Defender Assessment -- Displays selected Defender
  protection statuses and signature information.
- Windows Update Assessment -- Checks for pending Windows updates.
- Security Assessment -- Summarizes the selected checks as passed
  or requiring attention.
- Machine Learning Risk Prediction -- Uses a Random Forest model
  to classify the collected inputs into a risk category.
- Local Network Device Discovery -- Displays IPv4 devices already
  present in the Windows neighbor cache, including IP address, MAC
  address, neighbor state, and interface.
- Scan History -- Saves security assessment results in a local
  SQLite database and displays previous scans.
Technology Stack
  Area                 Technologies
  Frontend             Next.js, React, TypeScript, Tailwind CSS
Charts               Recharts
Backend              Python, FastAPI
System information   psutil, Windows PowerShell
Machine Learning     scikit-learn, pandas, joblib
Database             SQLite
Project Structure
AI_AGENT_BASED/
├── app/                         # Next.js application pages and styles
├── components/                  # Dashboard and UI components
├── backend/
│   ├── main.py                  # FastAPI application and API routes
│   ├── ml_model.py              # Machine learning model support
│   ├── network_scanner.py       # Windows neighbor-cache discovery
│   ├── security_risk_model.joblib
│   ├── requirements.txt
│   └── security_scans.db        # Created/used for scan history
├── package.json
└── README.md
Requirements
- Windows 10 or Windows 11
- Python 3
- Node.js and npm
- PowerShell
- Git (for version control)
Setup and Run
1. Clone the repository
git clone https://github.com/snehajalihal/AI_AGENT_BASED.git
cd AI_AGENT_BASED
2. Set up the backend
Open a terminal in the project folder:
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Start the FastAPI server:
python -m uvicorn main:app --reload
The backend runs at:
- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs
3. Set up the frontend
Open a second terminal in the project root:
npm install
npm.cmd run dev
Open the dashboard at:

http://localhost:3000

Keep both the backend and frontend terminals running while using the
application.
API Endpoints
  Method               Endpoint                         Purpose
  GET                  /                              Backend home/status

  GET                  /api/system/metrics            Retrieve system
metrics

  GET                  /api/network/devices           Retrieve devices
from the Windows
IPv4 neighbor cache

  GET                  /api/security/firewall         Retrieve Firewall
status

  GET                  /api/security/defender         Retrieve Microsoft
Defender status

  GET                  /api/security/windows-update   Retrieve Windows
Update status

  GET                  /api/security/assessment       Retrieve the
combined security
assessment

  POST                 /api/security/scan             Run and save a
security scan
GET                  /api/security/history          Retrieve saved scan
history
The interactive API documentation at /docs can be used to test these
endpoints.
Notes and Limitations
- Windows-specific checks and local network discovery are designed for
  a Windows environment.
- Network discovery reads the existing Windows IPv4 neighbor cache. It
  does not actively scan the network or scan device ports. The
  cache may not contain every device currently connected to the
  network.
- Neighbor states are reported by Windows. For example, Reachable
  indicates a recently confirmed neighbor entry, while Stale
  indicates an entry whose reachability has not recently been
  confirmed.
- The Random Forest model is an educational prototype trained on a
  synthetic, rule-labelled dataset. Its output is not a validated
  security verdict and should not be treated as proof that a system is
  safe or compromised.
- The application checks selected security settings; it does not
  identify every Windows vulnerability.
Future Improvements
Potential improvements can be considered as part of future development,
such as clearer reporting, additional test coverage, and improved
handling of unavailable Windows security information.
Author
Sneha Jalihal

GitHub: https://github.com/snehajalihal