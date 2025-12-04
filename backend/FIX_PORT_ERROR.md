# Port 5000 Already in Use - Fix Guide

## Error:
```
Error: listen EADDRINUSE: address already in use :::5000
```

## Solution:

### Option 1: Kill Process Using Port 5000 (Recommended)

**PowerShell Command:**
```powershell
# Find process using port 5000
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "Process $process killed successfully"
} else {
    Write-Host "No process found on port 5000"
}
```

**Or Simple Method:**
```powershell
# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Option 2: Change Port in .env file

Create/Update `backend/.env`:
```env
PORT=5001
```

Then restart server:
```bash
cd backend
node server.js
```

### Option 3: Find and Kill Specific Process

**Step 1:** Find process
```powershell
netstat -ano | findstr :5000
```

**Step 2:** Kill process (replace PID with actual process ID)
```powershell
taskkill /PID <PID> /F
```

## After Fixing:

Start server:
```bash
cd backend
node server.js
```

Should show:
```
🚀 Server is running on http://localhost:5000
📡 API Endpoints:
   GET  /api/gallery - Get all images
   ...
```

## Quick Fix Script:

Save this as `kill-port.ps1`:
```powershell
$port = 5000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "✅ Killed process $process on port $port"
} else {
    Write-Host "✅ Port $port is free"
}
```

Run: `.\kill-port.ps1`

