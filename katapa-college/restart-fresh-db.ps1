$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$freshDbPath = Join-Path $root "mongodb-data-new"

function Stop-PortProcess {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | ForEach-Object {
            try {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop
                Write-Output "Stopped process on port $Port (PID: $($_.OwningProcess))"
            } catch {
                Write-Output "Could not stop process on port $Port (PID: $($_.OwningProcess))"
            }
        }
    } else {
        Write-Output "No process on port $Port"
    }
}

Write-Output "Stopping old app/database processes..."
Stop-PortProcess -Port 27017
Stop-PortProcess -Port 5000
Stop-PortProcess -Port 5173
Stop-PortProcess -Port 5174
Stop-PortProcess -Port 5175
Stop-PortProcess -Port 5176

if (-not (Test-Path $freshDbPath)) {
    New-Item -ItemType Directory -Path $freshDbPath | Out-Null
    Write-Output "Created fresh database folder: $freshDbPath"
} else {
    Write-Output "Using fresh database folder: $freshDbPath"
}

Write-Output ""
Write-Output "Starting project with fresh local database..."
powershell -ExecutionPolicy Bypass -File (Join-Path $root "start-project.ps1")
