-- Homepage Dynamic Data Tables
-- All static data को dynamic बनाने के लिए tables

-- ========== 1. DEPARTMENTS TABLE ==========
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'Department name',
  `icon` VARCHAR(10) DEFAULT '🏗️' COMMENT 'Emoji icon',
  `description` TEXT NOT NULL COMMENT 'Department description',
  `students` INT(11) DEFAULT 0 COMMENT 'Total students',
  `teachers` INT(11) DEFAULT 0 COMMENT 'Total teachers',
  `color` VARCHAR(20) DEFAULT '#3B82F6' COMMENT 'Display color',
  `hod` VARCHAR(100) DEFAULT NULL COMMENT 'Head of Department name',
  `display_order` INT(11) DEFAULT 0 COMMENT 'Order for display',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Academic departments';

-- ========== 2. DEPARTMENT FACULTY TABLE ==========
CREATE TABLE IF NOT EXISTS `department_faculty` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `department_id` INT(11) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'Faculty name',
  `designation` VARCHAR(50) DEFAULT NULL COMMENT 'Designation (HOD, Prof, Lecturer, etc.)',
  `display_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE,
  INDEX `idx_department` (`department_id`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Department faculty members';

-- ========== 3. DEPARTMENT STUDENTS TABLE ==========
CREATE TABLE IF NOT EXISTS `department_students` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `department_id` INT(11) NOT NULL,
  `year` INT(11) NOT NULL COMMENT 'Year (1, 2, 3)',
  `student_count` INT(11) DEFAULT 0 COMMENT 'Number of students in this year',
  `student_list` TEXT DEFAULT NULL COMMENT 'Comma-separated or JSON list of students',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE,
  INDEX `idx_department_year` (`department_id`, `year`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Department students by year';

-- ========== 4. FEATURES TABLE ==========
CREATE TABLE IF NOT EXISTS `homepage_features` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `icon` VARCHAR(10) NOT NULL COMMENT 'Emoji icon',
  `title` VARCHAR(255) NOT NULL COMMENT 'Feature title',
  `description` TEXT NOT NULL COMMENT 'Feature description',
  `background_gradient` VARCHAR(255) DEFAULT NULL COMMENT 'CSS gradient background',
  `link` VARCHAR(500) DEFAULT NULL COMMENT 'Optional link URL',
  `display_order` INT(11) DEFAULT 0 COMMENT 'Order for display',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Homepage features section';

-- ========== 5. PLACEMENT DETAILS TABLE ==========
CREATE TABLE IF NOT EXISTS `placement_details` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `percentage` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Placement percentage',
  `packages` VARCHAR(100) DEFAULT NULL COMMENT 'Salary packages range',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Placement statistics';

-- ========== 6. PLACEMENT COMPANIES TABLE ==========
CREATE TABLE IF NOT EXISTS `placement_companies` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'Company name',
  `display_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recruiting companies';

-- ========== 7. PLACEMENT SECTORS TABLE ==========
CREATE TABLE IF NOT EXISTS `placement_sectors` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT 'Sector name',
  `display_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Placement sectors';

-- ========== 8. EVENTS TABLE ==========
CREATE TABLE IF NOT EXISTS `homepage_events` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `date` VARCHAR(50) NOT NULL COMMENT 'Event date (e.g., "12 Nov")',
  `title` VARCHAR(255) NOT NULL COMMENT 'Event title',
  `time` VARCHAR(50) DEFAULT NULL COMMENT 'Event time (e.g., "09:00 AM")',
  `location` VARCHAR(255) DEFAULT NULL COMMENT 'Event location',
  `description` TEXT DEFAULT NULL COMMENT 'Event description',
  `event_date` DATE DEFAULT NULL COMMENT 'Full date for sorting',
  `display_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_event_date` (`event_date`),
  INDEX `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Upcoming events for homepage';

-- ========== INSERT SAMPLE DATA ==========

-- Departments
INSERT INTO `departments` (`name`, `icon`, `description`, `students`, `teachers`, `color`, `hod`, `display_order`, `is_active`) VALUES
('Civil Engineering', '🏗️', 'Infrastructure & construction technology', 85, 5, '#3B82F6', 'Dr. Ramesh Kumar', 1, 1),
('Electronics Engineering', '📱', 'Electronic systems & circuits', 75, 5, '#8B5CF6', 'Dr. Ashok Menon', 2, 1),
('Information Technology', '💻', 'Computer systems & networking', 95, 4, '#10B981', 'Mr. Govind thuwal', 3, 1),
('Pharmacy', '💊', 'Pharmaceutical sciences', 88, 5, '#F59E0B', 'Dr. Lakshmi Pillai', 4, 1),
('Mechanical Engineering', '🔧', 'Design & manufacturing', 78, 4, '#EF4444', 'Dr. Prabhu Modi', 5, 1);

-- Department Faculty
INSERT INTO `department_faculty` (`department_id`, `name`, `designation`, `display_order`) VALUES
-- Civil Engineering
(1, 'Dr. Ramesh Kumar', 'HOD', 1),
(1, 'Prof. Sunita Sharma', 'Professor', 2),
(1, 'Dr. Vikram Singh', 'Associate Professor', 3),
(1, 'Ms. Priya Verma', 'Lecturer', 4),
(1, 'Mr. Ajay Kumar', 'Lecturer', 5),
-- Electronics Engineering
(2, 'Dr. Ashok Menon', 'HOD', 1),
(2, 'Prof. Deepa Krishnan', 'Professor', 2),
(2, 'Dr. Ravi Pillai', 'Associate Professor', 3),
(2, 'Ms. Kavita Joshi', 'Lecturer', 4),
(2, 'Mr. Sunil Sharma', 'Lecturer', 5),
-- Information Technology
(3, 'Mr. Govind thuwal', 'HOD', 1),
(3, 'Lecturer Mayank Bisht', 'Lecturer', 2),
(3, 'Lecturer Ms. Kiran Chandra', 'Lecturer', 3),
(3, 'Lecturer Harsita Rai Bagoli', 'Lecturer', 4),
-- Pharmacy
(4, 'Dr. Lakshmi Pillai', 'HOD', 1),
(4, 'Prof. Srinivas Rao', 'Professor', 2),
(4, 'Dr. Anjali Menon', 'Associate Professor', 3),
(4, 'Ms. Radha Iyer', 'Lecturer', 4),
(4, 'Mr. Rahul Verma', 'Lecturer', 5),
-- Mechanical Engineering
(5, 'Dr. Prabhu Modi', 'HOD', 1),
(5, 'Prof. Swati Reddy', 'Professor', 2),
(5, 'Dr. Rajesh Kumar', 'Associate Professor', 3),
(5, 'Ms. Kavya Sharma', 'Lecturer', 4);

-- Department Students (Sample - आप अपने actual data से replace करें)
INSERT INTO `department_students` (`department_id`, `year`, `student_count`, `student_list`) VALUES
(1, 1, 20, 'YEAR 1: Rahul Sharma, Priya Verma, Aman Kumar, Riya Patel, Vikas Singh, Anjali Joshi (20 students)'),
(1, 2, 25, 'YEAR 2: Suresh Kumar, Deepa Singh, Mohit Sharma, Kavita Devi, Arjun Singh, Neha Kumari (25 students)'),
(1, 3, 40, 'YEAR 3: Gaurav Verma, Swati Gupta, Ankit Yadav, Pooja Sharma, Vivek Kumar, Shruti Singh (40 students)'),
(2, 1, 25, 'YEAR 1: Arjun Mehta, Sneha Reddy, Karan Malhotra, Divya Agarwal (25 students)'),
(2, 2, 25, 'YEAR 2: Rajesh Kumar, Pooja Nair, Mohit Tiwari, Sanjana Das (25 students)'),
(2, 3, 25, 'YEAR 3: Akhil Pillai, Deepika Rao, Siddharth Iyer, Meera Subramanian (25 students)'),
(3, 1, 30, 'YEAR 1: Rajesh Kumar, Pooja Nair, Mohit Tiwari, Sanjana Das, Ravi Kumar (30 students)'),
(3, 2, 30, 'YEAR 2: Akhil Pillai, Deepika Rao, Siddharth Iyer, Meera Subramanian, Gaurav Nair (30 students)'),
(3, 3, 35, 'YEAR 3: Aditya Sharma, Sunita Desai, Rohan Patel, Priya Singh, Jayesh Modi (35 students)'),
(4, 1, 28, 'YEAR 1: Akhil Pillai, Deepika Rao, Siddharth Iyer, Meera Subramanian (28 students)'),
(4, 2, 30, 'YEAR 2: Aditya Sharma, Sunita Desai, Rohan Patel, Priya Singh (30 students)'),
(4, 3, 30, 'YEAR 3: Vivek Kumar, Shruti Singh, Ankit Yadav, Pooja Sharma (30 students)'),
(5, 1, 25, 'YEAR 1: Aditya Sharma, Sunita Desai, Rohan Patel, Priya Singh (25 students)'),
(5, 2, 25, 'YEAR 2: Vivek Kumar, Shruti Singh, Ankit Yadav, Pooja Sharma (25 students)'),
(5, 3, 28, 'YEAR 3: Arjun Singh, Neha Kumari, Gaurav Verma, Swati Gupta (28 students)');

-- Features
INSERT INTO `homepage_features` (`icon`, `title`, `description`, `background_gradient`, `link`, `display_order`, `is_active`) VALUES
('📚', 'Quality Education', 'Industry-relevant curriculum with hands-on training for real-world success.', 'linear-gradient(135deg, #667eea, #764ba2)', NULL, 1, 1),
('💼', 'Placement Support', '55% placement success rate with top companies and dedicated placement cell.', 'linear-gradient(135deg, #10b981, #059669)', NULL, 2, 1),
('🏗️', 'Modern Labs', 'State-of-the-art laboratories with latest equipment and technology.', 'linear-gradient(135deg, #f59e0b, #d97706)', NULL, 3, 1),
('🎓', 'Expert Faculty', 'Experienced faculty from industry and academia with proven track record.', 'linear-gradient(135deg, #3b82f6, #2563eb)', NULL, 4, 1),
('🌐', '24/7 Digital Library', 'Access thousands of e-books and journals online anytime.', 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 'https://engineering.library.cornell.edu/e-book-collections/', 5, 1),
('🚀', 'Innovation Hub', 'Cutting-edge research facilities and innovation centers.', 'linear-gradient(135deg, #ef4444, #dc2626)', NULL, 6, 1);

-- Placement Details
INSERT INTO `placement_details` (`percentage`, `packages`, `is_active`) VALUES
(55.00, 'INR 2.5 LPA - 6 LPA', 1);

-- Placement Companies
INSERT INTO `placement_companies` (`name`, `display_order`, `is_active`) VALUES
('TCS', 1, 1),
('Infosys', 2, 1),
('Wipro', 3, 1),
('L&T Construction', 4, 1),
('Tata Motors', 5, 1),
('Tech Mahindra', 6, 1);

-- Placement Sectors
INSERT INTO `placement_sectors` (`name`, `display_order`, `is_active`) VALUES
('IT Services', 1, 1),
('Manufacturing', 2, 1),
('Pharmaceuticals', 3, 1),
('Construction', 4, 1),
('Automotive', 5, 1);

-- Events
INSERT INTO `homepage_events` (`date`, `title`, `time`, `location`, `description`, `event_date`, `display_order`, `is_active`) VALUES
('12 Nov', 'Hackathon 2025', '09:00 AM', 'Auditorium', '48-hour coding challenge with exciting prizes and industry recognition.', '2025-11-12', 1, 1),
('20 Nov', 'IoT Workshop', '10:00 AM', 'ECE Lab', 'Hands-on workshop with sensors, microcontrollers, and cloud integration.', '2025-11-20', 2, 1),
('05 Dec', 'Career Fair', '09:30 AM', 'Sports Complex', 'Meet top recruiters and alumni mentors in our annual career fair.', '2025-12-05', 3, 1);

-- Query Examples:
-- Get all departments with faculty count
-- SELECT d.*, COUNT(df.id) as faculty_count FROM departments d 
-- LEFT JOIN department_faculty df ON d.id = df.department_id AND df.is_active = 1 
-- WHERE d.is_active = 1 GROUP BY d.id ORDER BY d.display_order;

-- Get department with full details
-- SELECT d.*, 
--   GROUP_CONCAT(CONCAT(df.name, ' - ', df.designation) SEPARATOR ', ') as faculty_list,
--   GROUP_CONCAT(CONCAT('YEAR ', ds.year, ': ', ds.student_list) SEPARATOR '; ') as student_info
-- FROM departments d
-- LEFT JOIN department_faculty df ON d.id = df.department_id AND df.is_active = 1
-- LEFT JOIN department_students ds ON d.id = ds.department_id AND ds.is_active = 1
-- WHERE d.id = 1 AND d.is_active = 1
-- GROUP BY d.id;
