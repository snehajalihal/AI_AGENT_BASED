
import json
import sqlite3
import subprocess
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path

import joblib
import psutil
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from network_scanner import discover_local_devices


# --------------------------------------------------
# PATHS AND MODEL
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "security_scans.db"
MODEL_PATH = BASE_DIR / "security_risk_model.joblib"

try:
    ml_model = joblib.load(MODEL_PATH)
    ML_MODEL_AVAILABLE = True
    ML_MODEL_ERROR = None
except Exception as error:
    ml_model = None
    ML_MODEL_AVAILABLE = False
    ML_MODEL_ERROR = str(error)


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="AI-Based Windows System Vulnerability & Network Scanner",
    description="Backend API for Windows system monitoring and security assessment",
    version="1.6.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------------

def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def database_connection():
    connection = get_db_connection()

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database():
    with database_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS security_assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_time TEXT NOT NULL,
                total_checks INTEGER NOT NULL,
                passed_checks INTEGER NOT NULL,
                failed_checks INTEGER NOT NULL,
                assessment_data TEXT NOT NULL
            )
        """)


initialize_database()


# --------------------------------------------------
# POWERSHELL HELPER
# --------------------------------------------------

def run_powershell(command, timeout=15):
    result = subprocess.run(
        [
            "powershell.exe",
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            command
        ],
        capture_output=True,
        text=True,
        timeout=timeout
    )

    if result.returncode != 0:
        raise RuntimeError(
            result.stderr.strip() or "PowerShell command failed"
        )

    if not result.stdout.strip():
        raise RuntimeError("PowerShell returned an empty response")

    return json.loads(result.stdout)


# --------------------------------------------------
# HOME ENDPOINT
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Windows System Scanner API is running",
        "version": "1.6.0",
        "ml_model_available": ML_MODEL_AVAILABLE
    }


# --------------------------------------------------
# SYSTEM METRICS
# --------------------------------------------------

@app.get("/api/system/metrics")
def get_system_metrics():
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("C:\\")

    return {
        "cpu_usage": psutil.cpu_percent(interval=0.5),
        "memory_usage": memory.percent,
        "memory_total_gb": round(memory.total / (1024 ** 3), 2),
        "disk_usage": disk.percent,
        "disk_total_gb": round(disk.total / (1024 ** 3), 2)
    }


# --------------------------------------------------
# LOCAL NETWORK DEVICE DISCOVERY
# --------------------------------------------------

@app.get("/api/network/devices")
def get_local_network_devices():
    """
    Return devices already present in the Windows IPv4 neighbor cache.
    This does not actively probe devices or scan ports.
    """
    return discover_local_devices()


# --------------------------------------------------
# WINDOWS FIREWALL STATUS
# --------------------------------------------------

@app.get("/api/security/firewall")
def get_firewall_status():
    command = """
    Get-NetFirewallProfile |
    Select-Object Name, Enabled |
    ConvertTo-Json -Compress
    """

    try:
        profiles = run_powershell(command)

        if isinstance(profiles, dict):
            profiles = [profiles]

        formatted_profiles = [
            {
                "name": profile["Name"],
                "enabled": bool(profile["Enabled"])
            }
            for profile in profiles
        ]

        all_enabled = (
            len(formatted_profiles) == 3
            and all(profile["enabled"] for profile in formatted_profiles)
        )

        return {
            "success": True,
            "profiles": formatted_profiles,
            "all_enabled": all_enabled
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Firewall check timed out"
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error)
        }


# --------------------------------------------------
# MICROSOFT DEFENDER STATUS
# --------------------------------------------------

@app.get("/api/security/defender")
def get_defender_status():
    command = """
    $status = Get-MpComputerStatus

    $signatureDate = $null

    if ($status.AntivirusSignatureLastUpdated) {
        $signatureDate = $status.AntivirusSignatureLastUpdated.ToString("o")
    }

    @{
        antivirus_enabled = $status.AntivirusEnabled
        real_time_protection = $status.RealTimeProtectionEnabled
        antispyware_enabled = $status.AntispywareEnabled
        signature_last_updated = $signatureDate
    } | ConvertTo-Json -Compress
    """

    try:
        data = run_powershell(command)

        return {
            "success": True,
            "antivirus_enabled": data.get("antivirus_enabled"),
            "real_time_protection": data.get("real_time_protection"),
            "antispyware_enabled": data.get("antispyware_enabled"),
            "signature_last_updated": data.get("signature_last_updated")
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Defender check timed out"
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error)
        }


# --------------------------------------------------
# WINDOWS UPDATE STATUS
# --------------------------------------------------

@app.get("/api/security/windows-update")
def get_windows_update_status():
    command = """
    $session = New-Object -ComObject Microsoft.Update.Session
    $searcher = $session.CreateUpdateSearcher()
    $result = $searcher.Search("IsInstalled=0 and IsHidden=0")

    $updates = @(
        foreach ($update in $result.Updates) {
            @{
                title = $update.Title
                severity = $update.MsrcSeverity
                reboot_required = $update.RebootRequired
            }
        }
    )

    @{
        pending_count = $result.Updates.Count
        updates = $updates
    } | ConvertTo-Json -Depth 4 -Compress
    """

    try:
        data = run_powershell(command, timeout=90)

        return {
            "success": True,
            "pending_count": data.get("pending_count", 0),
            "updates": data.get("updates") or []
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Windows Update check timed out"
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error)
        }


# --------------------------------------------------
# MACHINE LEARNING SECURITY RISK PREDICTION
# --------------------------------------------------

def predict_security_risk(firewall, defender, windows_update):

    if not ML_MODEL_AVAILABLE:
        return {
            "success": False,
            "predicted_risk": None,
            "message": "ML model is unavailable",
            "error": ML_MODEL_ERROR
        }

    # Check whether all required security information is available.
    if not all([
        firewall.get("success"),
        defender.get("success"),
        windows_update.get("success")
    ]):
        return {
            "success": False,
            "predicted_risk": None,
            "message": "Required security information could not be collected"
        }

    pending_count = windows_update.get("pending_count")

    if pending_count is None:
        return {
            "success": False,
            "predicted_risk": None,
            "message": "Pending update information is unavailable"
        }

    try:
        memory = psutil.virtual_memory()
        cpu_usage = psutil.cpu_percent(interval=0.5)

        defender_enabled = all([
            defender.get("antivirus_enabled") is True,
            defender.get("real_time_protection") is True,
            defender.get("antispyware_enabled") is True
        ])

        # Collect the five model input features.
        input_features = {
            "firewall_enabled": int(
                firewall.get("all_enabled") is True
            ),
            "defender_enabled": int(defender_enabled),
            "updates_pending": int(pending_count),
            "cpu_usage": round(cpu_usage, 2),
            "memory_usage": round(memory.percent, 2)
        }

        # Convert input features into a DataFrame.
        input_data = pd.DataFrame([input_features])

        # Generate prediction.
        prediction = ml_model.predict(input_data)[0]

        return {
            "success": True,
            "model": "Random Forest",
            "predicted_risk": str(prediction),
            "input_features": input_features,
            "message": "Security risk prediction completed"
        }

    except Exception as error:
        return {
            "success": False,
            "predicted_risk": None,
            "message": "Could not generate ML prediction",
            "error": str(error)
        }


# --------------------------------------------------
# COLLECT SECURITY ASSESSMENT
# --------------------------------------------------

def collect_security_assessment():

    firewall = get_firewall_status()
    defender = get_defender_status()
    windows_update = get_windows_update_status()

    firewall_passed = (
        firewall.get("success", False)
        and firewall.get("all_enabled", False)
    )

    defender_passed = (
        defender.get("success", False)
        and defender.get("antivirus_enabled") is True
        and defender.get("real_time_protection") is True
        and defender.get("antispyware_enabled") is True
    )

    update_passed = (
        windows_update.get("success", False)
        and windows_update.get("pending_count") == 0
    )

    checks = {
        "firewall": firewall_passed,
        "defender": defender_passed,
        "windows_update": update_passed
    }

    collection_status = {
        "firewall": firewall.get("success", False),
        "defender": defender.get("success", False),
        "windows_update": windows_update.get("success", False)
    }

    passed_checks = sum(checks.values())
    failed_checks = len(checks) - passed_checks

    unavailable_checks = [
        name
        for name, collected in collection_status.items()
        if not collected
    ]

    # Generate a separate ML prediction.
    ml_prediction = predict_security_risk(
        firewall,
        defender,
        windows_update
    )

    assessment_data = {
        "checks": checks,
        "collection_status": collection_status,
        "firewall": firewall,
        "defender": defender,
        "windows_update": windows_update,
        "ml_prediction": ml_prediction
    }

    return {
        "success": True,
        **assessment_data,
        "assessment_summary": {
            "total_checks": len(checks),
            "passed_checks": passed_checks,
            "failed_checks": failed_checks,
            "unavailable_checks": unavailable_checks
        }
    }


# --------------------------------------------------
# GET LATEST SECURITY ASSESSMENT
# --------------------------------------------------

@app.get("/api/security/assessment")
def get_security_assessment():
    return collect_security_assessment()


# --------------------------------------------------
# RUN AND SAVE A NEW SECURITY SCAN
# --------------------------------------------------

@app.post("/api/security/scan")
def run_security_scan():

    assessment = collect_security_assessment()

    scan_time = datetime.now().astimezone().isoformat()
    summary = assessment["assessment_summary"]

    try:
        with database_connection() as connection:

            cursor = connection.execute("""
                INSERT INTO security_assessments (
                    scan_time,
                    total_checks,
                    passed_checks,
                    failed_checks,
                    assessment_data
                )
                VALUES (?, ?, ?, ?, ?)
            """, (
                scan_time,
                summary["total_checks"],
                summary["passed_checks"],
                summary["failed_checks"],
                json.dumps(assessment)
            ))

            scan_id = cursor.lastrowid

        return {
            **assessment,
            "scan_id": scan_id,
            "scan_time": scan_time,
            "message": "Security scan completed and saved successfully"
        }

    except Exception as error:
        return {
            "success": False,
            "error": f"Could not save scan history: {str(error)}"
        }


# --------------------------------------------------
# SECURITY SCAN HISTORY
# --------------------------------------------------

@app.get("/api/security/history")
def get_security_history():

    try:
        with database_connection() as connection:

            rows = connection.execute("""
                SELECT *
                FROM security_assessments
                ORDER BY id DESC
                LIMIT 50
            """).fetchall()

        return {
            "success": True,
            "total_records": len(rows),
            "history": [
                {
                    "id": row["id"],
                    "scan_time": row["scan_time"],
                    "total_checks": row["total_checks"],
                    "passed_checks": row["passed_checks"],
                    "failed_checks": row["failed_checks"],
                    "assessment_data": json.loads(
                        row["assessment_data"]
                    )
                }
                for row in rows
            ]
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error)
        }
