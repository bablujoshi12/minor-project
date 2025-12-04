# Backend Setup Guide

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- express (Web framework)
- mysql2 (MySQL database driver)
- cors (Cross-Origin Resource Sharing)
- dotenv (Environment variables)
- nodemon (Development auto-reload)

## Step 2: Database Setup

1. **Create Database:**
```sql
CREATE DATABASE gpl_lohaghat_db;
USE gpl_lohaghat_db;
```

2. **Run SQL File:**
```bash
mysql -u root -p gpl_lohaghat_db < ../database/gallery_table.sql
```

Or manually execute the SQL from `database/gallery_table.sql`

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=gpl_lohaghat_db
PORT=5000
NODE_ENV=development
```

## Step 4: Start Backend Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Server will start on `http://localhost:5000`

## Step 5: Test Connection

### Health Check:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running and database is connected",
  "timestamp": "2025-01-11T10:30:00.000Z"
}
```

### Get Gallery Images:
```bash
curl http://localhost:5000/api/gallery
```

## Step 6: Insert Your Images

### Using SQL:
```sql
INSERT INTO gallery_images 
  (image_url, image_title, category, alt_text, display_order, is_active)
VALUES 
  ('/images/gallery/campus1.jpg', 'Main Campus', 'Campus', 'GPL Campus View', 1, 1),
  ('/images/gallery/library.jpg', 'Library', 'Facilities', 'Central Library', 2, 1);
```

### Using API:
```bash
curl -X POST http://localhost:5000/api/gallery \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "/images/gallery/campus1.jpg",
    "image_title": "Main Campus Building",
    "category": "Campus",
    "alt_text": "GPL Main Campus",
    "display_order": 1
  }'
```

## Frontend Configuration

Update `src/components/Home.js` line 206:
```javascript
// For development:
const apiResponse = await fetch('http://localhost:5000/api/gallery');

// For production, update with your backend URL:
const apiResponse = await fetch('https://api.yoursite.com/api/gallery');
```

## Troubleshooting

### Database Connection Error:
1. Check MySQL is running: `mysql --version`
2. Verify credentials in `.env` file
3. Check database exists: `SHOW DATABASES;`
4. Verify table exists: `USE gpl_lohaghat_db; SHOW TABLES;`

### CORS Error:
- Backend already has CORS enabled
- If issues persist, check frontend URL in CORS config

### Port Already in Use:
- Change PORT in `.env` file
- Or kill process: `lsof -ti:5000 | xargs kill`

## API Endpoints Summary

- `GET /api/gallery` - Get all active images (URLs array)
- `GET /api/gallery/full` - Get full image details
- `GET /api/gallery/category/:category` - Get by category
- `POST /api/gallery` - Add new image
- `PUT /api/gallery/:id` - Update image
- `DELETE /api/gallery/:id` - Delete image
- `GET /api/health` - Health check

