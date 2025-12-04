# PowerShell script to safely start the server
# This script kills any existing process on port 5000 before starting

Write-Host "🔄 Checking port 5000 and backend processes..." -ForegroundColor Cyan

# Kill any process using port 5000
$portProcess = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($portProcess) {
    Write-Host "⚠️  Found $($portProcess.Count) process(es) on port 5000, killing them..." -ForegroundColor Yellow
    $portProcess | ForEach-Object { 
        $proc = Get-Process -Id $_ -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "   Killing PID: $_ ($($proc.ProcessName))" -ForegroundColor Gray
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 2
}

# Also check for any node processes running server.js in backend directory
$backendPath = $PSScriptRoot
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
foreach ($proc in $nodeProcesses) {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
    if ($cmdLine -and $cmdLine -like "*server.js*" -and $cmdLine -like "*$backendPath*") {
        Write-Host "⚠️  Found existing backend server process (PID: $($proc.Id)), killing it..." -ForegroundColor Yellow
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

# Verify port is free
$stillInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($stillInUse) {
    Write-Host "❌ Port 5000 is still in use! Please close the application manually." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Port 5000 is free" -ForegroundColor Green

# Start the server
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Set-Location $PSScriptRoot
node server.js


