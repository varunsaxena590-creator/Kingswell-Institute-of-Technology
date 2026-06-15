$mongoDataPath = Join-Path $PSScriptRoot "..\mongodb-data"
$resolvedDataPath = [System.IO.Path]::GetFullPath($mongoDataPath)

if (-not (Test-Path $resolvedDataPath)) {
    New-Item -ItemType Directory -Path $resolvedDataPath | Out-Null
}

$mongod = Get-Command mongod -ErrorAction SilentlyContinue
if (-not $mongod) {
    Write-Output "MongoDB server command 'mongod' not found in PATH."
    Write-Output "Install MongoDB Community Server or run only app services with: npm run dev:app"
    exit 1
}

Write-Output "Starting MongoDB with dbpath: $resolvedDataPath"
& $mongod.Source --dbpath $resolvedDataPath
