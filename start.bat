@echo off
title AI_Crudapp Launcher
echo =================================================
echo   Launching AI_Crudapp (React + Node.js + MySQL)
echo =================================================

cd /d d:\Ai_Crudapp

if not exist frontend\node_modules (
    echo Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

if not exist backend\node_modules (
    echo Installing backend dependencies...
    cd backend && npm install && cd ..
)

echo Starting Backend Server (Port 5000)...
start "AI_Crudapp Backend" cmd /k "cd /d d:\Ai_Crudapp\backend && npm run dev"

echo Starting Frontend App (Port 5173)...
start "AI_Crudapp Frontend" cmd /k "cd /d d:\Ai_Crudapp\frontend && npm run dev"

echo.
echo =================================================
echo   Servers launched!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo =================================================
pause
