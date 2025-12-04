-- Complete System Database Schema
-- Admin, Teacher, Student, Parent Panels

USE gpl_lohaghat_db;

-- ========== ADMIN TABLE ==========
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Admin
INSERT INTO `admins` (`email`, `password`, `name`) VALUES
('vlogsnature05@gmail.com', '$2a$10$YourHashedPasswordHere', 'Root Admin');
-- Note: Password will be hashed by bcrypt: root23371826

-- ========== BRANCHES TABLE ==========
CREATE TABLE IF NOT EXISTS `branches` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `branches` (`name`, `code`, `description`) VALUES
('Information Technology', 'IT', 'IT Department'),
('Civil Engineering', 'CIVIL', 'Civil Engineering Department'),
('Electronics Engineering', 'ELECTRONICS', 'Electronics Engineering Department'),
('Pharmacy', 'PHARMACY', 'Pharmacy Department'),
('Mechanical Engineering', 'MECHANICAL', 'Mechanical Engineering Department');

-- ========== TEACHERS TABLE (Updated) ==========
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `branch_id` INT(11) NOT NULL,
  `phone` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert 5 Branch Teachers (Passwords will be hashed in backend)
-- IT: it018@gmail.com / it23371826
-- Civil: civil@gmail.com / civil23371826
-- Electronics: electronics@gmail.com / electronics23371826
-- Pharmacy: pharmacy@gmail.com / pharmacy23371826
-- Mechanical: mechanical@gmail.com / mechanical23371826

-- ========== STUDENTS TABLE (Updated) ==========
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `roll_no` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(255),
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `branch_id` INT(11) NOT NULL,
  `year` INT(11) DEFAULT 1,
  `section` VARCHAR(10),
  `dob` DATE,
  `phone` VARCHAR(20),
  `father_name` VARCHAR(255),
  `mother_name` VARCHAR(255),
  `parent_email` VARCHAR(255),
  `parent_phone` VARCHAR(20),
  `blood_group` VARCHAR(10),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`),
  INDEX `idx_roll_no` (`roll_no`),
  INDEX `idx_email` (`email`),
  INDEX `idx_branch` (`branch_id`),
  INDEX `idx_parent_email` (`parent_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== PARENTS TABLE ==========
CREATE TABLE IF NOT EXISTS `parents` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `student_id` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  INDEX `idx_email` (`email`),
  INDEX `idx_student` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== NOTICES TABLE ==========
CREATE TABLE IF NOT EXISTS `notices` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `sender_type` ENUM('admin', 'teacher', 'system') NOT NULL,
  `sender_id` INT(11),
  `recipient_type` ENUM('all', 'student', 'teacher', 'parent', 'branch', 'specific') NOT NULL,
  `recipient_id` INT(11) DEFAULT NULL,
  `branch_id` INT(11) DEFAULT NULL,
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_recipient` (`recipient_type`, `recipient_id`),
  INDEX `idx_branch` (`branch_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== ASSIGNMENTS TABLE ==========
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `file_url` VARCHAR(500),
  `teacher_id` INT(11) NOT NULL,
  `branch_id` INT(11) NOT NULL,
  `year` INT(11),
  `due_date` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`),
  INDEX `idx_teacher` (`teacher_id`),
  INDEX `idx_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== ATTENDANCE TABLE ==========
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `student_id` INT(11) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'absent',
  `branch_id` INT(11) NOT NULL,
  `teacher_id` INT(11),
  `remarks` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`),
  INDEX `idx_student` (`student_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_branch` (`branch_id`),
  UNIQUE KEY `unique_attendance` (`student_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== MARKS TABLE ==========
CREATE TABLE IF NOT EXISTS `marks` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `student_id` INT(11) NOT NULL,
  `semester` INT(11) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `marks_obtained` DECIMAL(5,2),
  `max_marks` DECIMAL(5,2) DEFAULT 100,
  `branch_id` INT(11) NOT NULL,
  `teacher_id` INT(11),
  `exam_type` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`),
  INDEX `idx_student` (`student_id`),
  INDEX `idx_semester` (`semester`),
  INDEX `idx_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== MESSAGES TABLE ==========
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `sender_type` ENUM('admin', 'teacher', 'student', 'parent') NOT NULL,
  `sender_id` INT(11) NOT NULL,
  `recipient_type` ENUM('admin', 'teacher', 'student', 'parent', 'all') NOT NULL,
  `recipient_id` INT(11),
  `subject` VARCHAR(255),
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_recipient` (`recipient_type`, `recipient_id`),
  INDEX `idx_sender` (`sender_type`, `sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

