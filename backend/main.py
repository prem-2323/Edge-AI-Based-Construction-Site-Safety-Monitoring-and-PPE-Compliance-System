"""
FastAPI backend for safety surveillance: YOLOv8 + ByteTrack, PPE, alerts, analytics.
Run: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

import uuid
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from config import UPLOAD_DIR, OUTPUT_DIR, MODEL_PATH
from services.model_loader import load_model, get_model, reset_model
from services.alert_engine import get_all as get_alerts, clear as clear_alerts
from services.analytics import get as get_analytics, update as set_analytics
from services.video_processor import run_pipeline

# In-memory: current job and output path for optional video download
_current_job: dict = {
    "running": False,
    "status": "idle",
    "input_name": None,
    "output_path": None,
    "error": None,
}


def _process_in_background(video_path: str) -> None:
    global _current_job
    out_path = OUTPUT_DIR / f"{Path(video_path).stem}_out.mp4"
    try:
        _current_job["running"] = True
        _current_job["status"] = "processing"
        _current_job["error"] = None
        _current_job["output_path"] = str(out_path)
        model = get_model()
        run_pipeline(model, video_path, str(out_path))
    except Exception as e:
        # Ensure analytics has some default on failure
        set_analytics(0, 0, 0, len(get_alerts()))
        _current_job["status"] = "failed"
        _current_job["error"] = str(e)
        raise
    finally:
        _current_job["running"] = False
        if _current_job.get("status") != "failed":
            _current_job["status"] = "ready"
        _current_job["output_path"] = str(out_path) if out_path.exists() else None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model once at startup
    try:
        load_model()
    except FileNotFoundError:
        pass  # run in demo mode without .pt
    yield
    # shutdown: nothing to do
    pass


app = FastAPI(title="Edge AI-Based Construction Site Safety Monitoring and PPE Compliance System API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----- API 1: Upload Video -----
@app.post("/api/upload-video")
async def upload_video(file: UploadFile = File(...)):
    if not file.filename or not any(file.filename.lower().endswith(ext) for ext in (".mp4", ".avi", ".mov", ".mkv", ".webm")):
        raise HTTPException(400, "Video file required (.mp4, .avi, .mov, .mkv, .webm)")
    name = f"{uuid.uuid4().hex}_{Path(file.filename or '').name}"
    path = UPLOAD_DIR / name
    content = await file.read()
    path.write_bytes(content)
    clear_alerts()
    set_analytics(0, 0, 0, 0)
    _current_job.update(
        {
            "running": True,
            "status": "queued",
            "input_name": file.filename,
            "output_path": None,
            "error": None,
        }
    )
    threading.Thread(target=_process_in_background, args=(str(path),), daemon=True).start()
    return {"status": "processing_started"}


# ----- API 2: Alerts -----
@app.get("/api/alerts")
def alerts():
    return get_alerts()


# ----- API 3: Analytics -----
@app.get("/api/analytics")
def analytics():
    return get_analytics()


# ----- API 4: Processed video (optional) -----
@app.get("/api/output-video")
def output_video():
    p = _current_job.get("output_path")
    if not p or not Path(p).exists():
        raise HTTPException(404, "No processed video available yet")
    return FileResponse(p, media_type="video/mp4", filename="output.mp4")


@app.get("/api/status")
def job_status():
    p = _current_job.get("output_path")
    return {
        "running": bool(_current_job.get("running")),
        "status": _current_job.get("status", "idle"),
        "input_name": _current_job.get("input_name"),
        "output_ready": bool(p and Path(p).exists()),
        "output_url": "/api/output-video" if p and Path(p).exists() else None,
        "error": _current_job.get("error"),
        "has_model": get_model() is not None,
        "model_path": str(MODEL_PATH),
    }


@app.post("/api/reload-model")
def reload_model():
    model = reset_model()
    return {
        "loaded": model is not None,
        "model_path": str(MODEL_PATH),
    }
