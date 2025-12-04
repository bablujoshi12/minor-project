-- Fix Students Table Structure
-- Use the correct database

USE smart_campus;

-- Drop old students table if exists (CAUTION: This will delete all data)
-- DROP TABLE IF EXISTS students;

-- Create new students table with correct structure
CREATE TABLE IF NOT EXISTS `students_new` (
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
  INDEX `idx_roll_no` (`roll_no`),
  INDEX `idx_email` (`email`),
  INDEX `idx_branch` (`branch_id`),
  INDEX `idx_parent_email` (`parent_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Check if branches table exists, if not create it
CREATE TABLE IF NOT EXISTS `branches` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert branches if not exists
INSERT IGNORE INTO `branches` (`name`, `code`, `description`) VALUES
('Information Technology', 'IT', 'IT Department'),
('Civil Engineering', 'CIVIL', 'Civil Engineering Department'),
('Electronics Engineering', 'ELECTRONICS', 'Electronics Engineering Department'),
('Pharmacy', 'PHARMACY', 'Pharmacy Department'),
('Mechanical Engineering', 'MECHANICAL', 'Mechanical Engineering Department');

-- Migration: Copy data from old students table to new (if needed)
-- Note: Only run this if you want to migrate data from old structure

-- After verification, rename tables:
-- RENAME TABLE students TO students_old_backup;
-- RENAME TABLE students_new TO students;

