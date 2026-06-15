$ErrorActionPreference = "Continue"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidDir = Join-Path $root ".pids"

if (!(Test-Path $pidDir)) {
  Write-Host "No PID folder found. Nothing to stop."
  exit 0
}

Get-ChildItem -Path $pidDir -Filter "*.pid" | ForEach-Object {
  $name = $_.BaseName
  $pidValue = Get-Content $_.FullName -ErrorAction SilentlyContinue

  if ($pidValue -and (Get-Process -Id $pidValue -ErrorAction SilentlyContinue)) {
    taskkill /PID $pidValue /T /F | Out-Null
    Write-Host "Stopped $name. PID: $pidValue"
  } else {
    Write-Host "$name was not running."
  }

  Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
}

Write-Host "All services stopped."
