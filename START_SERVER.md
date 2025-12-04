# 🚀 Server Start Guide

## ✅ Database Connection - WORKING!
Database connection test passed successfully!

## अब Server Start करें:

### Step 1: Backend Server Start करें

**Terminal 1 (Backend):**
```powershell
cd backend
node server.js
```

आपको यह दिखना चाहिए:
```
✅ Database connected successfully
📊 Connected to database: smart_campus
🚀 Server running on http://localhost:5000
📚 API endpoints available at http://localhost:5000/api
```

### Step 2: Frontend Start करें

**Terminal 2 (Frontend) - नया terminal खोलें:**
```powershell
npm start
```

आपको यह दिखना चाहिए:
```
Compiled successfully!
You can now view the app in the browser.
Local: http://localhost:3000
```

## ✅ Test करें:

1. Browser में जाएं: `http://localhost:3000`
2. Backend API test: `http://localhost:5000/api/health`
   - Should return: `{"status":"ok","message":"GPL Lohaghat Backend is running"}`

## 🐛 अगर Error आए:

### Database Connection Error:
- Check: MySQL service running है या नहीं
- Check: `backend/.env` file में credentials सही हैं
- Run: `cd backend && node test-db-connection.js`

### Port Already in Use:
- Check: कोई दूसरा process port 5000 use कर रहा है
- Solution: उस process को close करें या port change करें

### Frontend Connection Error:
- Check: Backend server चल रहा है या नहीं
- Check: `http://localhost:5000/api/health` response दे रहा है या नहीं
- Check: Browser console में CORS errors हैं या नहीं

## 📝 Important Files:

- **Backend Config:** `backend/.env`
- **Database:** `smart_campus` (MySQL)
- **Frontend Config:** Root `.env` (REACT_APP_API_URL)

## 🎉 Success Indicators:

✅ Backend: Server running message
✅ Database: Connection successful message  
✅ Frontend: Browser opens automatically
✅ API: Health endpoint returns OK

