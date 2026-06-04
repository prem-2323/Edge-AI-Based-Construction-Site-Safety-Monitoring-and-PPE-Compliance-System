# Edge AI-Based Construction Site Safety Monitoring and PPE Compliance System

Lightweight dashboard that demonstrates PPE (helmet/vest) detection on uploaded CCTV video using a FastAPI backend and an optional YOLOv8 model. The frontend is a Vite + React + TypeScript app with Tailwind and shadcn-ui components.

**Repo structure (top-level)**

- `src/` — frontend source (React + TypeScript)
- `backend/` — FastAPI backend, video processing, and model loader
- `backend/models/` — put your `best.pt` YOLOv8 model here (optional)
- `backend/uploads/` — incoming uploaded videos (created at runtime)
- `backend/output/` — annotated output videos (created at runtime)

**Ports**

- Frontend: `http://localhost:8080` (Vite dev server)
- API: `http://localhost:8000` (FastAPI / Uvicorn)

## Prerequisites

- Node.js (for frontend)
- Python 3.8+ (for backend)
- On Windows use PowerShell or CMD for provided scripts

## Quick start (recommended)

Windows (PowerShell):

```powershell
.\run.ps1
```

Windows (CMD):

```bat
run.bat
```

These helper scripts will install frontend and backend dependencies (when missing) and start the backend API and frontend dev server.

## Manual start (frontend)

Install and run the frontend from project root:

```bash
npm install
npm run dev
```

The frontend reads the API base from `VITE_API_URL` (defaults to `http://localhost:8000`).

## Manual start (backend)

From the `backend/` directory:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
# optional: place your YOLOv8 model at backend/models/best.pt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or from the project root (if Python deps are available):

```bash
npm run api
```

If you do not have a YOLO model, the backend runs in a demo mode that simulates alerts.

## Backend configuration

- `backend/config.py` controls required PPE (`REQUIRED_PPE`), temporal voting window (`TEMPORAL_WINDOW`), and whether a model is required (`REQUIRE_MODEL`).

Place a trained YOLOv8 model at `backend/models/best.pt` to enable real processing. If `REQUIRE_MODEL` environment variable is set to `true`, the server will raise an error when the model file is missing.

## Train the model locally

The dataset is already included in `backend/construction-ppe/`. To train a model on your machine, run:

```powershell
cd backend
python train_ppe_model.py --epochs 50 --batch 16 --device 0 --copy-best
```

The script will:

- train a YOLOv8 model using `backend/construction-ppe/data.yaml`
- validate the trained weights
- run a sample inference from the validation split
- save `backend/output/sample_prediction.jpg`
- save `backend/output/metrics_comparison.png`
- copy the trained weights to `backend/models/best.pt` when `--copy-best` is set

If you want to train on CPU, pass `--device cpu`.

## API endpoints

- `POST /api/upload-video` — Upload a video file (.mp4, .avi, .mov, .mkv, .webm). Starts background processing. Returns `{ "status": "processing_started" }`.
- `GET /api/alerts` — Returns current alert records: `[{ "worker_id", "status", "missing", "timestamp" }]`.
- `GET /api/analytics` — Analytics summary: `{ "total_workers", "safe_count", "unsafe_count", "alerts_count", "violation_rate" }`.
- `GET /api/output-video` — Returns annotated output video if available.

## Development notes

- Frontend entry point: `src/main.tsx` and `src/App.tsx`.
- Backend entry point: `backend/main.py`.
- Video processing and alert logic live in `backend/services/video_processor.py`, `alert_engine.py`, `analytics.py`, and `model_loader.py`.

## Troubleshooting

- If FastAPI startup complains about `email-validator`, install/upgrade it:

```bash
pip install -U "email-validator>=2.0"
```

- If you see no model found but want to test UI flows, ensure `REQUIRE_MODEL` is not set to `true`.

## Next steps & ideas

- Swap or extend `REQUIRED_PPE` in `backend/config.py` to match your model's class names.
- Add unit/integration tests for the backend processing pipeline.
- Add authentication and persisted storage for alerts if using in production.

---

File: [backend/main.py](backend/main.py)
File: [src/main.tsx](src/main.tsx)

## External projects added

- `external/edge-ai-safety` — attempted to clone `https://github.com/prem-2323/Edge-AI-Based-Construction-Site-Safety-Monitoring-and-PPE-Compliance-System.git` into this folder. The remote repository appears empty or is private; only the Git metadata was created here. If you intended to import that project's files, please ensure the repo contains files or provide an archive/alternative URL.


