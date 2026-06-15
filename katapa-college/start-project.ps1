$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"
$mongoDataPath = Join-Path $root "mongodb-data-new"

function Stop-PortProcess {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | ForEach-Object {
            try {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop
                Write-Output "Stopped process on port $Port (PID: $($_.OwningProcess))"
            } catch {
                Write-Output "Could not stop process on port $Port"
            }
        }
    }
}

function Start-LoggedProcess {
    param(
        [string]$Name,
        [string]$WorkingDir,
        [string]$Command,
        [string]$OutLog,
        [string]$ErrLog
    )

    $fullOutLog = Join-Path $WorkingDir $OutLog
    $fullErrLog = Join-Path $WorkingDir $ErrLog

    if (Test-Path $fullOutLog) { Remove-Item -LiteralPath $fullOutLog -Force -ErrorAction SilentlyContinue }
    if (Test-Path $fullErrLog) { Remove-Item -LiteralPath $fullErrLog -Force -ErrorAction SilentlyContinue }

    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "cd /d `"$WorkingDir`" && $Command 1>`"$fullOutLog`" 2>`"$fullErrLog`"" `
        -WindowStyle Hidden | Out-Null

    Write-Output "$Name starting..."
}

Write-Output "Cleaning old processes..."
Stop-PortProcess -Port 5000
Stop-PortProcess -Port 5173
Stop-PortProcess -Port 5174
Stop-PortProcess -Port 5175

$mongod = Get-Command mongod -ErrorAction SilentlyContinue
if ($mongod) {
    if (-not (Test-Path $mongoDataPath)) {
        New-Item -ItemType Directory -Path $mongoDataPath | Out-Null
    }

    Start-LoggedProcess `
        -Name "Database" `
        -WorkingDir $root `
        -Command "`"$($mongod.Source)`" --dbpath `"$mongoDataPath`"" `
        -OutLog "db.out.log" `
        -ErrLog "db.err.log"
} else {
    Write-Output "Database skipped: 'mongod' not found in PATH"
}

Start-LoggedProcess `
    -Name "Backend" `
    -WorkingDir $backendPath `
    -Command "npm start" `
    -OutLog "backend.out.log" `
    -ErrLog "backend.err.log"

Start-LoggedProcess `
    -Name "Frontend" `
    -WorkingDir $frontendPath `
    -Command "npm run dev -- --host 127.0.0.1" `
    -OutLog "frontend.out.log" `
    -ErrLog "frontend.err.log"

Start-Sleep -Seconds 8

Write-Output ""
Write-Output "Status check:"

try {
    $frontend = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -Headers @{ Accept = "text/html" } -UseBasicParsing -TimeoutSec 5
    Write-Output "Frontend: UP ($($frontend.StatusCode))"
} catch {
    Write-Output "Frontend: DOWN"
}

try {
    $backend = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Output "Backend: UP ($($backend.StatusCode))"
} catch {
    Write-Output "Backend: DOWN"
}

if ($mongod) {
    try {
        $dbConn = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
        if ($dbConn) {
            Write-Output "Database: UP"
        } else {
            Write-Output "Database: DOWN"
        }
    } catch {
        Write-Output "Database: UNKNOWN"
    }
} else {
    Write-Output "Database: SKIPPED"
}

Write-Output ""
Write-Output "Frontend URL: http://127.0.0.1:5173"
Write-Output "Backend URL: http://127.0.0.1:5000"
Write-Output ""
Write-Output "Logs:"
Write-Output "  backend\\backend.out.log"
Write-Output "  backend\\backend.err.log"
Write-Output "  frontend\\frontend.out.log"
Write-Output "  frontend\\frontend.err.log"
