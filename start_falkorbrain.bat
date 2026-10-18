@echo off
echo =======================================================
echo   FalkorBrain - Multi-Agent Knowledge Graph Platform
echo   Team 7vengers - FalkorDB Hackathon
echo =======================================================

echo.
echo [1/3] Checking FalkorDB Docker container...
docker ps -q -f name=falkordb >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting FalkorDB container...
    docker run -d -p 6379:6379 --name falkordb falkordb/falkordb:latest 2>nul || docker start falkordb 2>nul
) else (
    echo FalkorDB container is already running.
)

echo.
echo [2/3] Launching FalkorBrain Backend (Port 4000)...
start "FalkorBrain-Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo.
echo [3/3] Launching FalkorBrain Frontend (Port 5173)...
start "FalkorBrain-Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both services launched!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:4000
echo =======================================================
