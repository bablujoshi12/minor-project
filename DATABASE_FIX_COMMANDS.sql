-- Quick Fix Commands for MySQL Database
-- Run these in MySQL Command Line or Workbench

-- Step 1: Create database
CREATE DATABASE IF NOT EXISTS smart_campus;
USE smart_campus;

-- Step 2: Create user (only if root access available)
CREATE USER IF NOT EXISTS 'smart_campus_user'@'localhost' IDENTIFIED BY 'harsiat23371826';
GRANT ALL PRIVILEGES ON smart_campus.* TO 'smart_campus_user'@'localhost';
FLUSH PRIVILEGES;

-- Step 3: Verify user exists
SELECT User, Host FROM mysql.user WHERE User = 'smart_campus_user';

-- Step 4: Test connection (from command line)
-- mysql -u smart_campus_user -p smart_campus
-- Password: harsiat23371826

