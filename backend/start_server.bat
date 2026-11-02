@echo off
echo.
echo  =====================================================
echo  VISHWAS-FDR Backend Server
echo  SIH 2026 ^| Team OG-7 ^| PS-26265
echo  =====================================================
echo  Starting FastAPI server on http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo  Press Ctrl+C to stop
echo  =====================================================
echo.
cd /d "%~dp0"
python -W ignore -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

