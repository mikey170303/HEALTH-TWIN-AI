@echo off
title HealthTwin AI Launcher
echo ========================================================
echo              Starting HealthTwin AI
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Setup Backend if needed
if not exist "backend\venv\Scripts\activate.bat" (
    echo [*] Setting up Python virtual environment for backend...
    python -m venv backend\venv
    call backend\venv\Scripts\activate.bat
    pip install -r backend\requirements.txt
    cd backend
    alembic upgrade head
    cd ..
)

:: 2. Setup Frontend if needed
if not exist "frontend\node_modules" (
    echo [*] Installing frontend npm packages...
    cd frontend
    call npm install
    cd ..
)

echo [1/2] Starting Backend API on http://localhost:8000 ...
start "HealthTwin Backend (Port 8000)" cmd /k "cd /d ""%~dp0backend"" && call venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Frontend on http://localhost:5173 ...
start "HealthTwin Frontend (Port 5173)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo Opening HealthTwin AI in your web browser...
start http://localhost:5173

echo.
echo ========================================================
echo   HealthTwin AI is running! Keep the open windows open.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ========================================================
pause
