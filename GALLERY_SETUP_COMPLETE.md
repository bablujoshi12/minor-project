# ✅ Gallery Database Connection - Complete Setup

## Status: Ready to Use!

Gallery API backend **already connected** है `backend/server.js` में। Ab bas setup करना है।

## Quick Setup (3 Steps):

### Step 1: Database Table Create करें

MySQL में run करें:
```sql
USE gpl_lohaghat_db;

-- अगर database नहीं है तो पहले create करें:
CREATE DATABASE IF NOT EXISTS gpl_lohaghat_db;
USE gpl_lohaghat_db;

-- Table create करें:
SOURCE database/gallery_table.sql;
```

या manually:
```sql
CREATE TABLE IF NOT EXISTS `gallery_images` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `image_url` VARCHAR(500) NOT NULL,
  `image_title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'Campus',
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `display_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 2: .env File Setup

`backend` folder में `.env` file create करें:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=gpl_lohaghat_db
PORT=5000
```

**Important:** अपनी MySQL password डालें!

### Step 3: Server Start करें

```bash
cd backend
npm start
```

Success message दिखेगा:
```
✅ Database connected successfully!
🚀 Server is running on http://localhost:5000
📡 API Endpoints:
   GET  /api/gallery - Get all images
```

## Images Insert करें:

### Option 1: SQL में directly
```sql
INSERT INTO gallery_images 
  (image_url, image_title, category, alt_text, display_order, is_active)
VALUES 
  ('/images/gallery/campus1.jpg', 'Main Campus Building', 'Campus', 'GPL Campus View', 1, 1),
  ('/images/gallery/library.jpg', 'Central Library', 'Facilities', 'Library Interior', 2, 1);
```

### Option 2: API से (Postman या curl)
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

## Test करें:

### 1. Health Check:
```bash
curl http://localhost:5000/api/health
```

### 2. Get Images:
```bash
curl http://localhost:5000/api/gallery
```

Expected Response:
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

### 3. Frontend Test:
1. Backend server running होना चाहिए
2. Frontend start करें (अगर नहीं चल रहा)
3. Home page open करें
4. Slide gallery में database से images दिखेंगी!

## Image Paths:

### Local Images (Best):
1. Images upload करें: `public/images/gallery/`
2. Database में path: `/images/gallery/filename.jpg`

### External URLs:
```sql
INSERT INTO gallery_images (image_url, ...) VALUES 
('https://example.com/image.jpg', ...);
```

## API Endpoints Available:

- `GET /api/gallery` - Get all active images (for slide gallery)
- `GET /api/gallery/full` - Get full image details
- `GET /api/gallery/category/:category` - Get by category
- `POST /api/gallery` - Add new image
- `PUT /api/gallery/:id` - Update image
- `DELETE /api/gallery/:id` - Delete image
- `GET /api/health` - Health check

## Troubleshooting:

### Database Connection Failed:
```
❌ Database connection failed: Access denied
```
**Solution:** `.env` में correct password check करें

### Table Not Found:
```
Table 'gpl_lohaghat_db.gallery_images' doesn't exist
```
**Solution:** `database/gallery_table.sql` file run करें

### No Images Showing:
1. Check database: `SELECT * FROM gallery_images WHERE is_active = 1;`
2. Check API: `curl http://localhost:5000/api/gallery`
3. Browser console check करें

## Current Files:

✅ `backend/server.js` - Gallery routes connected
✅ `database/gallery_table.sql` - Table structure ready
✅ `src/components/Home.js` - Frontend configured
✅ `backend/package.json` - Dependencies ready

**Everything is ready! Just need to:**
1. ✅ Database table create करें
2. ✅ .env configure करें  
3. ✅ Server start करें
4. ✅ Images insert करें

🎉 **Setup Complete!**

