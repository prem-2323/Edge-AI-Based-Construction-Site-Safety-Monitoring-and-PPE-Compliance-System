# Safety Watch - Run backend and frontend
# Run in PowerShell from project root: .\run.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# Frontend: ensure node_modules
if (-not (Test-Path "$root\node_modules")) {
  Write-Host "Installing frontend deps (npm install)..." -ForegroundColor Cyan
  & npm install
}

# Backend: upgrade email-validator (required by Pydantic/FastAPI)
Write-Host "Backend: email-validator>=2.0 (required by FastAPI)..." -ForegroundColor Cyan
try {
  & python -m pip install -U "email-validator>=2.0"
} catch {
  Write-Host "  Could not run 'python -m pip install'. Please ensure Python is on PATH or run the commands manually." -ForegroundColor Yellow
}
try {
  & python -m pip install -q -r "$root\backend\requirements.txt"
} catch {
  Write-Host "  Could not install backend requirements automatically. Run: python -m pip install -r backend\requirements.txt" -ForegroundColor Yellow
}

Write-Host "Starting backend in new window (http://localhost:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

Write-Host "Starting frontend (http://localhost:8080)..." -ForegroundColor Green
Write-Host "  API docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "  Ctrl+C to stop frontend. Close the backend window to stop the API.`n" -ForegroundColor Gray
& npm run dev
