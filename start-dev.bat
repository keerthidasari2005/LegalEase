@echo off
setlocal
cd /d "%~dp0"

echo Starting LegalEase Development Environment
echo ==============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

REM Check for .env file
if not exist "backend\.env" (
    echo backend\.env file not found.
    if exist "backend\.env.example" (
        echo Creating backend\.env from template...
        copy "backend\.env.example" "backend\.env" >nul
        echo Created backend\.env. Please add your GEMINI_API_KEY.
    ) else (
        echo backend\.env.example not found. Create backend\.env manually.
    )
)

echo.
echo Setting up Python backend...
pushd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate Python virtual environment.
    popd
    pause
    exit /b 1
)

echo Installing Python dependencies...
pip install -q -r requirements.txt
if errorlevel 1 (
    echo Failed to install Python dependencies.
    popd
    pause
    exit /b 1
)

REM Free port 5000 if a stale backend process is still running.
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":5000 .*LISTENING"') do (
    if not "%%P"=="0" (
        echo Port 5000 is in use by PID %%P. Stopping it...
        taskkill /PID %%P /F >nul 2>&1
    )
)

echo Starting Flask backend on http://localhost:5000
start "LegalEase Backend" cmd /c "python app.py"
popd

echo.
echo Setting up React frontend...
if not exist "node_modules\.bin\vite.cmd" (
    echo Installing Node.js dependencies...
    call npm ci
    if errorlevel 1 (
        echo npm ci failed.
        pause
        exit /b 1
    )
)

echo.
echo Starting React frontend on http://localhost:5173
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.

REM Free port 5173 if a stale process is still running.
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":5173 .*LISTENING"') do (
    if not "%%P"=="0" (
        echo Port 5173 is in use by PID %%P. Stopping it...
        taskkill /PID %%P /F >nul 2>&1
    )
)

call npm run dev -- --host localhost --port 5173 --strictPort

taskkill /FI "WINDOWTITLE eq LegalEase Backend*" /F >nul 2>&1
endlocal
