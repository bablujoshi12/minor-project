-- Script to add local images from C:\Users\ASUS\Desktop\image to database
-- First, check what images are available at: http://localhost:5000/api/local-images-list
-- Then update the paths below with your actual image filenames

-- Example: If your images are:
-- C:\Users\ASUS\Desktop\image\photo1.jpg
-- C:\Users\ASUS\Desktop\image\photo2.jpg
-- C:\Users\ASUS\Desktop\image\campus.jpg

-- Then add them like this (use actual filenames):

INSERT INTO `gallery_images` (`image_url`, `image_title`, `category`, `alt_text`, `display_order`, `is_active`) VALUES
('C:\\Users\\ASUS\\Desktop\\image\\photo1.jpg', 'Campus Photo 1', 'Campus', 'GPL Campus View', 1, 1),
('C:\\Users\\ASUS\\Desktop\\image\\photo2.jpg', 'Campus Photo 2', 'Campus', 'GPL Building', 2, 1),
('C:\\Users\\ASUS\\Desktop\\image\\campus.jpg', 'Main Campus', 'Campus', 'Main Building View', 3, 1);

-- OR use just the filename (backend will convert it automatically):
-- INSERT INTO `gallery_images` (`image_url`, `image_title`, `category`, `alt_text`, `display_order`, `is_active`) VALUES
-- ('photo1.jpg', 'Campus Photo 1', 'Campus', 'GPL Campus View', 1, 1),
-- ('photo2.jpg', 'Campus Photo 2', 'Campus', 'GPL Building', 2, 1);

-- To see all available local images, first run:
-- GET http://localhost:5000/api/local-images-list

