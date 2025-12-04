# Database Setup Guide - MySQL Connection Fix

## Problem
Database connection error: "Access denied for user 'root'@'localhost'"

## Solutions

### Solution 1: Run SQL File to Create User and Database

1. **Open MySQL Command Line:**
   ```
   mysql -u root -p
   ```
   (Enter your MySQL root password when prompted)

2. **Or Use MySQL Workbench:**
   - Open MySQL Workbench
   - Connect with root user and your password
   - Go to File > Open SQL Script
   - Select: `database/smart_campus.sql`
   - Click Execute (⚡ icon)

3. **After SQL file runs, it will:**
   - Create database `smart_campus`
   - Create user `smart_campus_user` with password `harsiat23371826`
   - Create all tables and insert sample data

### Solution 2: Update Root Password in .env

If you know your actual MySQL root password, update `backend/.env` file:

```
DB_USER=root
DB_PASSWORD=your_actual_root_password_here
```

### Solution 3: Create User Manually (If SQL file fails)

In MySQL, run these commands:

```sql
CREATE DATABASE IF NOT EXISTS smart_campus;

CREATE USER IF NOT EXISTS 'smart_campus_user'@'localhost' IDENTIFIED BY 'harsiat23371826';
GRANT ALL PRIVILEGES ON smart_campus.* TO 'smart_campus_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `backend/.env`:
```
DB_USER=smart_campus_user
DB_PASSWORD=harsiat23371826
```

## After Setup

1. Test connection:
   ```bash
   cd backend
   node test-db-connection.js
   ```

2. If test passes, start server:
   ```bash
   node server.js
   ```

3. You should see:
   ```
   ✅ Database connected successfully
   📊 Connected to database: smart_campus
   🚀 Server running on http://localhost:5000
   ```

