-- Gallery Images Table for GPL Lohaghat
-- Database: MySQL/MariaDB

CREATE TABLE IF NOT EXISTS `gallery_images` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `image_url` VARCHAR(500) NOT NULL COMMENT 'Image URL path or URL',
  `image_title` VARCHAR(255) NOT NULL COMMENT 'Title/Description of image',
  `category` VARCHAR(50) DEFAULT 'Campus' COMMENT 'Category: Campus, Events, Sports, Facilities, Academics, Activities',
  `alt_text` VARCHAR(255) DEFAULT NULL COMMENT 'Alt text for image accessibility',
  `display_order` INT(11) DEFAULT 0 COMMENT 'Order for display in gallery',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gallery images for slide gallery and photo gallery';

-- Insert Sample Data (You can replace these with your actual image URLs)
INSERT INTO `gallery_images` (`image_url`, `image_title`, `category`, `alt_text`, `display_order`, `is_active`) VALUES
('https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop', 'Main Campus Building - Aerial View', 'Campus', 'GPL Lohaghat Main Campus Building Aerial View', 1, 1),
('https://images.pexels.com/photos/159775/library-adult-reading-students-159775.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop', 'College Library - Students Reading', 'Facilities', 'Central Library with Students Studying', 2, 1),
('https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop', 'Modern Classroom Building', 'Academics', 'Modern Classroom with Advanced Facilities', 3, 1),
('https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop', 'Campus Library Interior', 'Facilities', 'Interior View of Central Library', 4, 1),
('https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop', 'Students Studying Together', 'Activities', 'Group Study Session at Campus', 5, 1),
('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop', 'Electronics Laboratory', 'Facilities', 'Electronics Engineering Laboratory', 6, 1),
('https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop', 'Campus Study Area', 'Facilities', 'Study Area for Students', 7, 1),
('https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop', 'Engineering Workshop', 'Facilities', 'Engineering Workshop for Hands-on Training', 8, 1);

-- Query to get all active gallery images ordered by display_order
-- SELECT * FROM `gallery_images` WHERE `is_active` = 1 ORDER BY `display_order` ASC, `id` ASC;

-- Query to get images by category
-- SELECT * FROM `gallery_images` WHERE `is_active` = 1 AND `category` = 'Campus' ORDER BY `display_order` ASC;

-- Query to update image order
-- UPDATE `gallery_images` SET `display_order` = 1 WHERE `id` = 1;

-- Query to deactivate an image
-- UPDATE `gallery_images` SET `is_active` = 0 WHERE `id` = 1;

