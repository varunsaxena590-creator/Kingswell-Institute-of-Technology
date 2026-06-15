$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

foreach ($port in @(5000, 5001, 5173)) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

  foreach ($connection in $connections) {
    try {
      Stop-Process -Id $connection.OwningProcess -Force -ErrorAction Stop
      Write-Host "Stopped old process on port $port" -ForegroundColor DarkYellow
    } catch {
      Write-Host "Could not stop process on port $port" -ForegroundColor Yellow
    }
  }
}

if (-not (Test-Path $backend)) {
  Write-Host "Backend folder not found: $backend" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $frontend)) {
  Write-Host "Frontend folder not found: $frontend" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path (Join-Path $backend ".env")) -and (Test-Path (Join-Path $backend ".env.example"))) {
  Copy-Item (Join-Path $backend ".env.example") (Join-Path $backend ".env")
}

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Push-Location $backend
if (-not (Test-Path "node_modules")) {
  npm install
}
Pop-Location

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Push-Location $frontend
if (-not (Test-Path "node_modules")) {
  npm install
}
Pop-Location

Write-Host "Starting backend on http://localhost:5001" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$backend`"; npm run dev"

Write-Host "Starting frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$frontend`"; npm run dev"

Start-Sleep -Seconds 8
Write-Host "Opening frontend in browser..." -ForegroundColor Green
Start-Process "http://127.0.0.1:5173"

Write-Host ""
Write-Host "If frontend uses another port, check the frontend terminal output." -ForegroundColor Yellow
Write-Host "Backend health: http://localhost:5001/api/health" -ForegroundColor Yellow
Write-Host "Backend fallback: http://localhost:5000/api/health" -ForegroundColor Yellow
