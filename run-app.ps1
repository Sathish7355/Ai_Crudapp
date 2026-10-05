# One-click launcher for AI_Crudapp
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  🚀 Launching AI_Crudapp Full-Stack Project     " -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan

$WorkspaceRoot = "d:\Ai_Crudapp"

# 1. Check frontend dependencies
if (-not (Test-Path "$WorkspaceRoot\frontend\node_modules")) {
    Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Green
    npm --prefix "$WorkspaceRoot\frontend" install
}

# 2. Check backend dependencies
if (-not (Test-Path "$WorkspaceRoot\backend\node_modules")) {
    Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Green
    npm --prefix "$WorkspaceRoot\backend" install
}

# 3. Launch Backend in new window
Write-Host "`n📡 Starting Backend on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\backend'; Write-Host '--- Backend Server (Port 5000) ---' -ForegroundColor Cyan; npm run dev"

# 4. Launch Frontend in new window
Write-Host "💻 Starting Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\frontend'; Write-Host '--- Frontend Client (Port 5173) ---' -ForegroundColor Magenta; npm run dev"

Write-Host "`n✅ Both servers are launching!" -ForegroundColor Green
Write-Host "👉 Backend API:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "👉 Frontend App: http://localhost:5173" -ForegroundColor Magenta
Write-Host "`nTip: Make sure you entered your MySQL root password in 'backend/.env' if it is not empty.`n" -ForegroundColor Yellow
