@echo off
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing frontend deps...
  call npm install
)

echo Backend: ensuring email-validator and deps...
echo Running Python package installs using `python -m pip`...
python -m pip install -U "email-validator>=2.0" 2>nul || (
  echo Failed to install email-validator automatically. Please run: python -m pip install -U "email-validator>=2.0"
)
python -m pip install -q -r backend\requirements.txt 2>nul || (
  echo Failed to install backend requirements automatically. Please run: python -m pip install -r backend\requirements.txt
)

echo Starting backend in new window...
start "Safety Watch API" cmd /k "cd /d "%~dp0" && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak >nul

echo Starting frontend...
echo   App:  http://localhost:8080
echo   API:  http://localhost:8000
echo   Docs: http://localhost:8000/docs
echo.
call npm run dev
