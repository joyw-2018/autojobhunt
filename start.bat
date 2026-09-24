@echo off
echo ========================================================
echo   Starting AutoJobHunt & Resume Tailor (Solo Copilot)
echo ========================================================
echo.

:: Start FastAPI Backend
start "AutoJobHunt Backend (Port 8000)" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Start Vite Frontend
start "AutoJobHunt Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo [OK] Backend starting at: http://localhost:8000 (API Docs: http://localhost:8000/docs)
echo [OK] Frontend starting at: http://localhost:5173
echo.
echo Browser will open shortly...
timeout /t 3 >nul
start http://localhost:5173
