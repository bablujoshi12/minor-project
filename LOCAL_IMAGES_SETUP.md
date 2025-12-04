# 📁 Local Images Setup Guide

## Problem Solved ✅
आपके `C:\Users\ASUS\Desktop\image` folder में images अब slide gallery में दिखेंगी!

## Step 1: Check Available Images

Backend server start करने के बाद, browser में open करें:
```
http://localhost:5000/api/local-images-list
```

यह आपको बताएगा कि Desktop/image folder में कौन सी images हैं।

## Step 2: Add Images to Database

### Option 1: SQL में Direct Add करें

1. MySQL में जाएं:
```bash
mysql -u root -p
USE gpl_lohaghat_db;
```

2. अपनी images add करें (actual filenames के साथ):
```sql
INSERT INTO `gallery_images` (`image_url`, `image_title`, `category`, `alt_text`, `display_order`, `is_active`) VALUES
('C:\\Users\\ASUS\\Desktop\\image\\photo1.jpg', 'Campus Photo 1', 'Campus', 'GPL Campus', 1, 1),
('C:\\Users\\ASUS\\Desktop\\image\\photo2.jpg', 'Library View', 'Facilities', 'Central Library', 2, 1),
('C:\\Users\\ASUS\\Desktop\\image\\campus.jpg', 'Main Building', 'Campus', 'Main Campus Building', 3, 1);
```

**या सिर्फ filename use करें (recommended):**
```sql
INSERT INTO `gallery_images` (`image_url`, `image_title`, `category`, `alt_text`, `display_order`, `is_active`) VALUES
('photo1.jpg', 'Campus Photo 1', 'Campus', 'GPL Campus', 1, 1),
('photo2.jpg', 'Library View', 'Facilities', 'Central Library', 2, 1),
('campus.jpg', 'Main Building', 'Campus', 'Main Campus Building', 3, 1);
```

### Option 2: API से Add करें

```bash
curl -X POST http://localhost:5000/api/gallery \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "photo1.jpg",
    "image_title": "Campus Photo 1",
    "category": "Campus",
    "alt_text": "GPL Campus View",
    "display_order": 1
  }'
```

## Step 3: Test

1. Frontend refresh करें
2. Home page पर slide gallery में images दिखनी चाहिए!
3. API check करें: `http://localhost:5000/api/gallery`

## How It Works 🔧

1. Backend automatically `C:\Users\ASUS\Desktop\image` folder को serve करता है
2. Database में आप Windows path (`C:\Users\...`) या सिर्फ filename (`photo.jpg`) add कर सकते हैं
3. Backend automatically convert करता है: 
   - `C:\Users\ASUS\Desktop\image\photo.jpg` → `http://localhost:5000/api/local-images/photo.jpg`
   - `photo.jpg` → `http://localhost:5000/api/local-images/photo.jpg`

## Supported Image Formats
- .jpg / .jpeg
- .png
- .gif
- .webp
- .bmp

## Troubleshooting

### Images नहीं दिख रही:
1. Backend server running है? (`http://localhost:5000/api/health`)
2. Images folder exist करता है? (`http://localhost:5000/api/local-images-list`)
3. Database में images added हैं? Check: `SELECT * FROM gallery_images;`
4. Browser console में errors check करें

### Folder नहीं मिल रहा:
- `C:\Users\ASUS\Desktop\image` folder exist करना चाहिए
- Folder में images होनी चाहिए (.jpg, .png, etc.)
- Backend server restart करें

## Quick Test Commands

```bash
# Check available images
curl http://localhost:5000/api/local-images-list

# Check gallery API
curl http://localhost:5000/api/gallery

# Health check
curl http://localhost:5000/api/health
```

## Example Response

```json
{
  "success": true,
  "path": "C:\\Users\\ASUS\\Desktop\\image",
  "count": 3,
  "images": [
    {
      "filename": "photo1.jpg",
      "url": "http://localhost:5000/api/local-images/photo1.jpg",
      "path": "C:\\Users\\ASUS\\Desktop\\image\\photo1.jpg"
    }
  ]
}
```

✅ Ab aapki images slide gallery mein dikhengi!

