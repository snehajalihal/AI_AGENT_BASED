
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil

app = FastAPI(
    title="AI-Based Windows System Vulnerability & Network Scanner",
    description="Backend API for Windows system monitoring",
    version="1.0.0"
)

# Allow the Next.js frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Windows System Scanner API is running"
    }


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
