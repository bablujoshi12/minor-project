# Database Setup Script
# This script will help you set up the MySQL database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Smart Campus Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$mysqlPath = "mysql"

# Check if MySQL is in PATH
try {
    $null = Get-Command mysql -ErrorAction Stop
    Write-Host "✅ MySQL command found" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL command not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please either:" -ForegroundColor Yellow
    Write-Host "  1. Add MySQL to PATH, OR" -ForegroundColor Yellow
    Write-Host "  2. Use MySQL Workbench to run database/smart_campus.sql manually" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "MySQL Workbench Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open MySQL Workbench" -ForegroundColor White
    Write-Host "  2. Connect to your MySQL server (root user)" -ForegroundColor White
    Write-Host "  3. File > Open SQL Script" -ForegroundColor White
    Write-Host "  4. Select: database/smart_campus.sql" -ForegroundColor White
    Write-Host "  5. Click Execute button (⚡)" -ForegroundColor White
    exit
}

Write-Host ""
Write-Host "Please enter your MySQL root password:" -ForegroundColor Yellow
Write-Host "(This is needed to create database and user)" -ForegroundColor Gray
Write-Host ""

$rootPassword = Read-Host "MySQL Root Password" -AsSecureString
$rootPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPassword)
)

Write-Host ""
Write-Host "Running database setup script..." -ForegroundColor Cyan

$sqlFile = Join-Path $PSScriptRoot "database\smart_campus.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit
}

Write-Host "📄 SQL file found: $sqlFile" -ForegroundColor Green

# Get absolute path and convert backslashes to forward slashes for MySQL
$sqlFileAbsolute = (Resolve-Path $sqlFile).Path
$sqlFileForMySQL = $sqlFileAbsolute -replace '\\', '/'

Write-Host "Running SQL file..." -ForegroundColor Cyan

# Method 1: Pipe SQL file content to mysql
try {
    # Read SQL file and pipe to mysql
    $sqlContent = Get-Content $sqlFile -Raw -Encoding UTF8
    
    # Set environment variable for password
    $env:MYSQL_PWD = $rootPasswordPlain
    
    # Run mysql command with SQL content piped
    $sqlContent | & mysql -u root --password=$rootPasswordPlain 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Test connection: cd backend && node test-db-connection.js" -ForegroundColor White
        Write-Host "  2. Start server: cd backend && node server.js" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Some errors occurred. Checking if database was created..." -ForegroundColor Yellow
        
        # Test if database exists
        $testResult = "SHOW DATABASES LIKE 'smart_campus';" | & mysql -u root --password=$rootPasswordPlain 2>&1
        
        if ($testResult -match "smart_campus") {
            Write-Host "✅ Database 'smart_campus' exists!" -ForegroundColor Green
            Write-Host "   (Some warnings may have appeared, but database was created)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Database setup failed. Please check:" -ForegroundColor Red
            Write-Host "  1. MySQL root password is correct" -ForegroundColor Yellow
            Write-Host "  2. MySQL service is running" -ForegroundColor Yellow
            Write-Host "  3. Try running SQL file manually in MySQL Workbench" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please try running SQL file manually in MySQL Workbench" -ForegroundColor Yellow
}

# Clear password from memory
$rootPasswordPlain = $null
$env:MYSQL_PWD = $null

