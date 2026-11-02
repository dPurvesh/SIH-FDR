@echo off
echo.
echo =======================================================================
echo   VISHWAS-FDR : AICTE Security Deposit ^& Lifecycle Management Portal
echo   Smart India Hackathon 2026 ^| PS ID: 26265 ^| Team OG-7
echo   Philosophy: "Trust Ladder + Never Miss a Deadline"
echo =======================================================================
echo.
echo [1/2] Starting Backend FastAPI Server (http://localhost:8000)...
start "VISHWAS-FDR Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && python -W ignore -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Next.js Command Center (http://localhost:3000)...
start "VISHWAS-FDR Frontend (Next.js)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =======================================================================
echo  VISHWAS-FDR is launching!
echo  - Frontend UI:  http://localhost:3000
echo  - Backend API:  http://localhost:8000
echo  - API Docs:     http://localhost:8000/docs
echo =======================================================================
echo.

