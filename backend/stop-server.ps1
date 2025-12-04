# PowerShell script to stop the server
# This script kills any process using port 5000

Write-Host "🛑 Stopping server on port 5000..." -ForegroundColor Yellow

$portProcess = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($portProcess) {
    $portProcess | ForEach-Object { 
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Killed process: $_" -ForegroundColor Green
    }
} else {
    Write-Host "ℹ️  No process found on port 5000" -ForegroundColor Cyan
}


