$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"
$mongoDataPath = Join-Path $root "data\db"

$jobs = @()
$mongoProcess = $null

function Write-Section {
  param([string]$Message)
  Write-Host ""
  Write-Host "==== $Message ===="
}

function Start-MongoDatabase {
  Write-Section "Starting Database"

  $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
  if ($mongoService) {
    if ($mongoService.Status -ne "Running") {
      try {
        Start-Service -Name "MongoDB"
        Write-Host "MongoDB service started."
      } catch {
        Write-Host "MongoDB service found but could not be started from this terminal."
        Write-Host "Run terminal as administrator or start MongoDB service manually."
      }
    } else {
      Write-Host "MongoDB service is already running."
    }
    return $null
  }

  $mongod = Get-Command "mongod" -ErrorAction SilentlyContinue
  if ($mongod) {
    New-Item -ItemType Directory -Force -Path $mongoDataPath | Out-Null
    $process = Start-Process `
      -FilePath $mongod.Source `
      -ArgumentList "--dbpath", "`"$mongoDataPath`"", "--bind_ip", "127.0.0.1" `
      -WindowStyle Hidden `
      -PassThru

    Write-Host "MongoDB started with local dbpath: $mongoDataPath"
    return $process
  }

  Write-Host "MongoDB service/mongod not found. If you use MongoDB Atlas, this is okay."
  Write-Host "If your project uses local MongoDB, install MongoDB or start it manually once."
  return $null
}

function Start-NpmJob {
  param(
    [string]$Name,
    [string]$WorkingDirectory,
    [string[]]$NpmArgs
  )

  Write-Host "Starting $Name: npm $($NpmArgs -join ' ')"
  return Start-Job -Name $Name -ArgumentList $WorkingDirectory, $NpmArgs -ScriptBlock {
    param($dir, $argsList)
    Set-Location $dir
    npm @argsList
  }
}

try {
  $mongoProcess = Start-MongoDatabase

  Write-Section "Starting Backend and Frontend"
  $jobs += Start-NpmJob -Name "backend" -WorkingDirectory $backendPath -NpmArgs @("start")
  $jobs += Start-NpmJob -Name "frontend" -WorkingDirectory $frontendPath -NpmArgs @("run", "dev")

  Write-Section "All Services Started"
  Write-Host "Backend and frontend output will appear below."
  Write-Host "Press Ctrl + C to stop this terminal session."
  Write-Host ""

  while ($true) {
    foreach ($job in $jobs) {
      Receive-Job -Job $job -Keep | ForEach-Object {
        Write-Host "[$($job.Name)] $_"
      }

      if ($job.State -in @("Failed", "Stopped", "Completed")) {
        Write-Host "[$($job.Name)] job state: $($job.State)"
      }
    }

    Start-Sleep -Seconds 1
  }
}
finally {
  Write-Section "Stopping Services"

  foreach ($job in $jobs) {
    Stop-Job -Job $job -ErrorAction SilentlyContinue
    Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
  }

  if ($mongoProcess -and !(Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue)) {
    Stop-Process -Id $mongoProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "MongoDB process stopped."
  }

  Write-Host "Stopped frontend/backend jobs."
}
