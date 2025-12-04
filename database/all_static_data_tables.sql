-- All Static Data Tables for GPL Lohaghat Smart Campus Portal
-- Run this SQL file to create all necessary tables

-- ========== 1. GALLERY IMAGES TABLE (Already created) ==========
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
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 2. DEPARTMENTS TABLE ==========
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(10) DEFAULT '🏗️',
  `description` VARCHAR(500) DEFAULT NULL,
  `students` INT(11) DEFAULT 0,
  `teachers` INT(11) DEFAULT 0,
  `hod` VARCHAR(255) DEFAULT NULL,
  `color` VARCHAR(20) DEFAULT '#3B82F6',
  `display_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 3. DEPARTMENT FACULTY TABLE ==========
CREATE TABLE IF NOT EXISTS `department_faculty` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `department_id` INT(11) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `designation` VARCHAR(100) DEFAULT NULL,
  `is_hod` TINYINT(1) DEFAULT 0,
  `display_order` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE,
  INDEX `idx_department` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 4. DEPARTMENT STUDENTS TABLE ==========
CREATE TABLE IF NOT EXISTS `department_students` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `department_id` INT(11) NOT NULL,
  `year` INT(11) NOT NULL COMMENT '1, 2, or 3',
  `student_names` TEXT DEFAULT NULL COMMENT 'Comma separated or JSON',
  `student_count` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE,
  INDEX `idx_department_year` (`department_id`, `year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 5. FEATURES TABLE ==========
CREATE TABLE IF NOT EXISTS `features` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `icon` VARCHAR(10) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `background_gradient` VARCHAR(200) DEFAULT NULL,
  `link` VARCHAR(500) DEFAULT NULL,
  `display_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 6. PLACEMENT DETAILS TABLE ==========
CREATE TABLE IF NOT EXISTS `placement_details` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `percentage` DECIMAL(5,2) DEFAULT 0.00,
  `min_package` VARCHAR(50) DEFAULT NULL,
  `max_package` VARCHAR(50) DEFAULT NULL,
  `package_range` VARCHAR(100) DEFAULT NULL,
  `companies` TEXT DEFAULT NULL COMMENT 'JSON array or comma separated',
  `sectors` TEXT DEFAULT NULL COMMENT 'JSON array or comma separated',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 7. EVENTS TABLE ==========
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `event_date` DATE DEFAULT NULL,
  `display_date` VARCHAR(50) DEFAULT NULL COMMENT 'Formatted date like "12 Nov"',
  `location` VARCHAR(255) DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `category` VARCHAR(50) DEFAULT 'General',
  `display_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_display_order` (`display_order`),
  INDEX `idx_date` (`event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== SAMPLE DATA INSERT QUERIES ==========

-- Insert Departments
INSERT INTO `departments` (`name`, `icon`, `description`, `students`, `teachers`, `hod`, `color`, `display_order`, `is_active`) VALUES
('Civil Engineering', '🏗️', 'Infrastructure & construction technology', 85, 5, 'Dr. Ramesh Kumar', '#3B82F6', 1, 1),
('Electronics Engineering', '📱', 'Electronic systems & circuits', 75, 5, 'Dr. Ashok Menon', '#8B5CF6', 2, 1),
('Information Technology', '💻', 'Computer systems & networking', 95, 4, 'Mr. Govind thuwal', '#10B981', 3, 1),
('Pharmacy', '💊', 'Pharmaceutical sciences', 88, 5, 'Dr. Lakshmi Pillai', '#F59E0B', 4, 1),
('Mechanical Engineering', '🔧', 'Design & manufacturing', 78, 4, 'Dr. Prabhu Modi', '#EF4444', 5, 1);

-- Insert Features
INSERT INTO `features` (`icon`, `title`, `description`, `background_gradient`, `link`, `display_order`, `is_active`) VALUES
('📚', 'Quality Education', 'Industry-relevant curriculum with hands-on training for real-world success.', 'linear-gradient(135deg, #667eea, #764ba2)', NULL, 1, 1),
('💼', 'Placement Support', '55% placement success rate with top companies and dedicated placement cell.', 'linear-gradient(135deg, #10b981, #059669)', NULL, 2, 1),
('🏗️', 'Modern Labs', 'State-of-the-art laboratories with latest equipment and technology.', 'linear-gradient(135deg, #f59e0b, #d97706)', NULL, 3, 1),
('🎓', 'Expert Faculty', 'Experienced faculty from industry and academia with proven track record.', 'linear-gradient(135deg, #3b82f6, #2563eb)', NULL, 4, 1),
('🌐', '24/7 Digital Library', 'Access thousands of e-books and journals online anytime.', 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 'https://engineering.library.cornell.edu/e-book-collections/', 5, 1),
('🚀', 'Innovation Hub', 'Cutting-edge research facilities and innovation centers.', 'linear-gradient(135deg, #ef4444, #dc2626)', NULL, 6, 1);

-- Insert Placement Details
INSERT INTO `placement_details` (`percentage`, `package_range`, `companies`, `sectors`) VALUES
(55.00, 'INR 2.5 LPA - 6 LPA', 
 '["TCS", "Infosys", "Wipro", "L&T Construction", "Tata Motors", "Tech Mahindra"]',
 '["IT Services", "Manufacturing", "Pharmaceuticals", "Construction", "Automotive"]');

-- Insert Events
INSERT INTO `events` (`title`, `description`, `display_date`, `category`, `display_order`, `is_active`) VALUES
('Tech Fest 2024', 'Annual technical festival with competitions and workshops', '12 Nov', 'Technical', 1, 1),
('Cultural Night', 'Evening of cultural performances and talent show', '25 Dec', 'Cultural', 2, 1);

