# Gallery Backend Integration Guide

## Database Setup

### 1. Create Database Table
Run the SQL file to create the table:
```bash
mysql -u your_username -p your_database < database/gallery_table.sql
```

Or manually execute the SQL from `database/gallery_table.sql`

### 2. Database Configuration
Update `backend/api/gallery.js` with your database credentials:
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'your_db_user',
  password: 'your_db_password',
  database: 'gpl_lohaghat_db'
};
```

## API Endpoints

### Get Gallery Images
```
GET /api/gallery
```
Returns: Array of image URLs for slide gallery
```json
{
  "success": true,
  "data": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "count": 8
}
```

### Get Full Gallery Details
```
GET /api/gallery/full
```
Returns: Full image objects with all details

### Get Images by Category
```
GET /api/gallery/category/Campus
```

### Add New Image
```
POST /api/gallery
Content-Type: application/json

{
  "image_url": "https://example.com/image.jpg",
  "image_title": "Campus Building",
  "category": "Campus",
  "alt_text": "Main Campus Building",
  "display_order": 1
}
```

### Update Image
```
PUT /api/gallery/:id
Content-Type: application/json

{
  "image_title": "Updated Title",
  "display_order": 2
}
```

### Delete Image (Soft Delete)
```
DELETE /api/gallery/:id
```

## Frontend Configuration

### Update API Base URL
In `src/components/Home.js`, update the API URL:
```javascript
const apiResponse = await fetch('YOUR_BACKEND_URL/api/gallery');
```

For production:
```javascript
const apiResponse = await fetch('https://api.yoursite.com/api/gallery');
```

## Adding Your Own Images

### Method 1: Direct SQL Insert
```sql
INSERT INTO gallery_images 
  (image_url, image_title, category, alt_text, display_order, is_active)
VALUES 
  ('/images/gallery/campus1.jpg', 'Main Campus Building', 'Campus', 'GPL Main Building', 1, 1),
  ('/images/gallery/library1.jpg', 'Central Library', 'Facilities', 'Library Interior', 2, 1);
```

### Method 2: Using API
```javascript
POST /api/gallery
{
  "image_url": "/images/gallery/campus1.jpg",
  "image_title": "Main Campus Building",
  "category": "Campus",
  "alt_text": "GPL Main Building",
  "display_order": 1
}
```

### Method 3: Upload Images First
1. Upload images to `public/images/gallery/` folder
2. Use relative paths: `/images/gallery/filename.jpg`
3. Or use full URLs: `https://yoursite.com/images/gallery/filename.jpg`

## Image Paths Options

1. **Local/Relative Paths:**
   ```sql
   INSERT INTO gallery_images (image_url, ...) VALUES 
   ('/images/gallery/campus1.jpg', ...);
   ```

2. **Full URLs:**
   ```sql
   INSERT INTO gallery_images (image_url, ...) VALUES 
   ('https://www.gplohaghat.org.in/uploads/gallery/campus1.jpg', ...);
   ```

3. **CDN URLs:**
   ```sql
   INSERT INTO gallery_images (image_url, ...) VALUES 
   ('https://cdn.yoursite.com/gallery/campus1.jpg', ...);
   ```

## Categories Available
- Campus
- Events
- Sports
- Facilities
- Academics
- Activities

## Testing
1. Start your backend server
2. Ensure database is connected
3. Check API endpoint: `http://localhost:5000/api/gallery`
4. Refresh frontend - images should load from database

