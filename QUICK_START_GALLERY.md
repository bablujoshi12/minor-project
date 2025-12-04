# Gallery Database Connection - Quick Start

## Step 1: Database Setup

### Create Database and Table:
```bash
# MySQL में login करें
mysql -u root -p

# Database create करें (अगर नहीं है)
CREATE DATABASE gpl_lohaghat_db;
USE gpl_lohaghat_db;

# Table create करने के लिए SQL file run करें
SOURCE database/gallery_table.sql;
```

या directly SQL run करें:
```sql
USE gpl_lohaghat_db;
SOURCE C:/Users/ASUS/Desktop/ytproject/database/gallery_table.sql;
```

## Step 2: Backend Configuration

### .env File Setup:
`backend` folder में `.env` file create करें:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gpl_lohaghat_db
PORT=5000
NODE_ENV=development
```

**Important:** अपनी actual MySQL password डालें!

## Step 3: Install Dependencies (if needed)

```bash
cd backend
npm install
```

## Step 4: Start Backend Server

```bash
cd backend
npm start
```

या development mode में:
```bash
npm run dev
```

Server start होने पर दिखेगा:
```
✅ Database connected successfully!
🚀 Server is running on http://localhost:5000
```

## Step 5: Insert Your Images

### Method 1: SQL में directly insert करें
```sql
USE gpl_lohaghat_db;

INSERT INTO gallery_images 
  (image_url, image_title, category, alt_text, display_order, is_active)
VALUES 
  ('/images/gallery/campus1.jpg', 'Main Campus Building', 'Campus', 'GPL Campus View', 1, 1),
  ('/images/gallery/library.jpg', 'Central Library', 'Facilities', 'Library Interior', 2, 1),
  ('https://example.com/campus2.jpg', 'Campus Aerial View', 'Campus', 'Aerial View', 3, 1);
```

### Method 2: API से add करें
```bash
curl -X POST http://localhost:5000/api/gallery \
  -H "Content-Type: application/json" \
  -d "{
    \"image_url\": \"/images/gallery/campus1.jpg\",
    \"image_title\": \"Main Campus Building\",
    \"category\": \"Campus\",
    \"alt_text\": \"GPL Main Campus\",
    \"display_order\": 1
  }"
```

## Step 6: Test Connection

### Health Check:
```bash
curl http://localhost:5000/api/health
```

### Get Gallery Images:
```bash
curl http://localhost:5000/api/gallery
```

Expected response:
```json
{
  "success": true,
  "data": [
    "/images/gallery/campus1.jpg",
    "/images/gallery/library.jpg"
  ],
  "count": 2
}
```

## Step 7: Frontend Test

Frontend automatically backend से images fetch करेगा:
1. Backend server start करें (`npm start` in backend folder)
2. Frontend start करें (if not running)
3. Home page open करें
4. Slide gallery में database से images दिखेंगी

## Troubleshooting

### Database Connection Error:
```
❌ Database connection failed: Access denied for user 'root'@'localhost'
```
**Fix:** `.env` file में correct password डालें

### Table Not Found:
```
Error: Table 'gpl_lohaghat_db.gallery_images' doesn't exist
```
**Fix:** SQL file run करें:
```sql
SOURCE database/gallery_table.sql;
```

### Port Already in Use:
```
Error: Port 5000 is already in use
```
**Fix:** `.env` में PORT change करें या existing server बंद करें

### No Images Showing:
- Check database में images हैं: `SELECT * FROM gallery_images WHERE is_active = 1;`
- Check API response: `curl http://localhost:5000/api/gallery`
- Browser console check करें for errors

## Image Paths

### Local Images (Recommended):
1. Images को `public/images/gallery/` folder में upload करें
2. Database में path डालें: `/images/gallery/filename.jpg`

### Full URLs:
Database में full URL डालें:
```sql
INSERT INTO gallery_images (image_url, ...) VALUES 
('https://www.gplohaghat.org.in/uploads/gallery/campus1.jpg', ...);
```

## Current Status

✅ Backend server setup complete
✅ Gallery API routes ready
✅ Database table structure ready
✅ Frontend configured to fetch from backend

**Next Steps:**
1. Database table create करें
2. `.env` file configure करें
3. Server start करें
4. Images insert करें
5. Test करें!

