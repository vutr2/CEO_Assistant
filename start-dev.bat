@echo off
echo ========================================
echo CEO AI Assistant - Development Startup
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/3] Checking MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo MongoDB is not running. Starting MongoDB...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo ERROR: Failed to start MongoDB
        echo Please start MongoDB manually: net start MongoDB
        pause
        exit /b 1
    )
) else (
    echo MongoDB is already running ✓
)
echo.

REM Start Backend
echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd /d backend && npm run dev"
timeout /t 3 >nul
echo Backend server starting on http://localhost:5000 ✓
echo.

REM Start Frontend
echo [3/3] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d frontend && npm run dev"
timeout /t 3 >nul
echo Frontend server starting on http://localhost:3000 ✓
echo.

echo ========================================
echo All services started successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo MongoDB:  mongodb://localhost:27017
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:3000/dashboard/overview

echo.
echo Application opened in browser!
echo.
echo To stop the servers:
echo - Close the Backend Server window
echo - Close the Frontend Server window
echo.
pause
