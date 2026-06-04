"""FastAPI backend for PPE detection on construction-site CCTV videos."""

from __future__ import annotations

import shutil
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

BACKEND = Path(__file__).resolve().parent
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from config import MODEL_PATH, OUTPUT_DIR, UPLOAD_DIR  # noqa: E402
from inference import build_empty_response, clear_model_cache, run_ppe_inference  # noqa: E402


LATEST_RESULT: dict[str, Any] = build_empty_response()
PROCESSING_STATE: dict[str, Any] = {
    "running": False,
    "error": None,
    "last_input": None,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="Edge AI-Based Construction Site Safety Monitoring and PPE Compliance System API",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")


def _save_upload(file: UploadFile) -> Path:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing video filename")

    if not file.filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv", ".webm")):
        raise HTTPException(status_code=400, detail="Video file required (.mp4, .avi, .mov, .mkv, .webm)")

    destination = UPLOAD_DIR / f"{Path(file.filename).stem}.mp4"

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return destination


def _process_video(video_path: Path) -> dict[str, Any]:
    PROCESSING_STATE.update({"running": True, "error": None, "last_input": video_path.name})
    try:
        return run_ppe_inference(
            video_path=video_path,
            model_path=MODEL_PATH,
            outputs_dir=OUTPUT_DIR,
        )
    except Exception as exc:  # pragma: no cover - surfaced to client
        PROCESSING_STATE["error"] = str(exc)
        raise
    finally:
        PROCESSING_STATE["running"] = False


@app.post("/upload-video")
@app.post("/api/upload-video")
async def upload_video(file: UploadFile = File(...)):
    uploaded_path = _save_upload(file)
    result = _process_video(uploaded_path)
    global LATEST_RESULT
    LATEST_RESULT = result
    return result


@app.get("/api/latest-result")
def latest_result():
    return LATEST_RESULT


@app.get("/api/status")
def status():
    return {
        "running": PROCESSING_STATE["running"],
        "error": PROCESSING_STATE["error"],
        "last_input": PROCESSING_STATE["last_input"],
        "has_model": MODEL_PATH.exists(),
        "model_path": str(MODEL_PATH),
        "latest_result": LATEST_RESULT,
    }


@app.post("/api/reload-model")
def reload_model():
    clear_model_cache()
    return {"loaded": MODEL_PATH.exists(), "model_path": str(MODEL_PATH)}