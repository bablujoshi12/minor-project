-- Alter Students Table to Match New Schema
-- This will add missing columns without losing existing data

USE smart_campus;

-- Add missing columns to students table
ALTER TABLE `students` 
  ADD COLUMN IF NOT EXISTS `email` VARCHAR(255) NULL AFTER `roll_no`,
  ADD COLUMN IF NOT EXISTS `password` VARCHAR(255) NULL AFTER `email`,
  ADD COLUMN IF NOT EXISTS `branch_id` INT(11) NULL AFTER `password`,
  ADD COLUMN IF NOT EXISTS `section` VARCHAR(10) NULL AFTER `year`,
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(20) NULL AFTER `section`,
  ADD COLUMN IF NOT EXISTS `mother_name` VARCHAR(255) NULL AFTER `father_name`,
  ADD COLUMN IF NOT EXISTS `parent_email` VARCHAR(255) NULL AFTER `mother_name`,
  ADD COLUMN IF NOT EXISTS `parent_phone` VARCHAR(20) NULL AFTER `parent_email`,
  ADD COLUMN IF NOT EXISTS `blood_group` VARCHAR(10) NULL AFTER `parent_phone`,
  ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `status`,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Add indexes
CREATE INDEX IF NOT EXISTS `idx_email` ON `students` (`email`);
CREATE INDEX IF NOT EXISTS `idx_branch` ON `students` (`branch_id`);
CREATE INDEX IF NOT EXISTS `idx_parent_email` ON `students` (`parent_email`);

-- If branch_id needs to be linked to branches table
-- First ensure branches table exists and has data
-- Then update branch_id based on department_id if possible

-- Note: If you're using department_id, you may need to map it to branch_id
-- Example mapping (adjust based on your actual data):
-- UPDATE students SET branch_id = 1 WHERE department_id = [IT department id];
-- UPDATE students SET branch_id = 2 WHERE department_id = [Civil department id];
-- etc.

-- Make password required for new registrations (allow NULL for existing records temporarily)
-- ALTER TABLE `students` MODIFY COLUMN `password` VARCHAR(255) NOT NULL;

