# Quick Start Guide - Backend Connection

## Step 1: MySQL Database Setup

1. **MySQL ko start karo** (agar running nahi hai)
   
2. **Database create karo:**
   ```sql
   CREATE DATABASE gpl_lohaghat;
   ```

3. **Schema import karo:**
   - MySQL Command Line ya phpMyAdmin se:
   ```bash
   mysql -u root -p gpl_lohaghat < backend/database/schema.sql
   ```
   
   Ya manually:
   - `backend/database/schema.sql` file kholo
   - Sab code copy karo
   - MySQL me paste karke run karo

## Step 2: Backend .env File Update

`backend/.env` file me apna MySQL password add karo:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=apna_mysql_password_yahan_dalo  ← YAHAN APNA PASSWORD DALO
DB_NAME=gpl_lohaghat
JWT_SECRET=gpl-lohaghat-secret-key-2024
PORT=5000
NODE_ENV=development
```

## Step 3: Backend Server Start Karo

**New Terminal/Command Prompt me:**

```bash
cd backend
npm start
```

Agar sab theek hai to yeh dikhega:
```
🚀 Server running on http://localhost:5000
📚 API endpoints available at http://localhost:5000/api
```

## Step 4: Frontend Server Start Karo

**Alag Terminal/Command Prompt me:**

```bash
npm start
```

## Step 5: Test Karo

Browser me jao: `http://localhost:3000/auth`

1. **Register karo** (kisi bhi role se - student, teacher, parent)
2. **Login karo**

## Agar Error Aaye:

### "Database connection failed"
- MySQL running hai na? Check karo
- `.env` file me password sahi hai na?
- Database `gpl_lohaghat` create ho gaya hai na?

### "Cannot GET /api/auth/login"
- Backend server port 5000 par chal raha hai na?
- Browser console me error kya hai?

### "fetch failed" ya "Network error"
- Backend server start hai na?
- Check karo: `http://localhost:5000/api/health` browser me kholo
- Agar "ok" message aaye to backend sahi hai

## Backend Health Check

Browser me yeh URL kholo:
```
http://localhost:5000/api/health
```

Agar "ok" message aaye to backend sahi kaam kar raha hai!

