-- Complete Fix for Students Table
-- Run this to update students table structure to match new system

USE smart_campus;

-- Step 1: Add all missing columns (MySQL doesn't support IF NOT EXISTS in ALTER, so we'll use a procedure)
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS add_column_if_not_exists(
    IN table_name VARCHAR(255),
    IN column_name VARCHAR(255),
    IN column_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = table_name
        AND COLUMN_NAME = column_name
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', table_name, '` ADD COLUMN `', column_name, '` ', column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- Step 2: Add missing columns
CALL add_column_if_not_exists('students', 'email', 'VARCHAR(255) NULL AFTER roll_no');
CALL add_column_if_not_exists('students', 'password', 'VARCHAR(255) NULL AFTER email');
CALL add_column_if_not_exists('students', 'branch_id', 'INT(11) NULL AFTER password');
CALL add_column_if_not_exists('students', 'section', 'VARCHAR(10) NULL');
CALL add_column_if_not_exists('students', 'phone', 'VARCHAR(20) NULL');
CALL add_column_if_not_exists('students', 'mother_name', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('students', 'parent_email', 'VARCHAR(255) NULL');
CALL add_column_if_not_exists('students', 'parent_phone', 'VARCHAR(20) NULL');
CALL add_column_if_not_exists('students', 'blood_group', 'VARCHAR(10) NULL');

-- Step 3: Add/Update timestamps if not exist
CALL add_column_if_not_exists('students', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_not_exists('students', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- Step 4: Map department_id to branch_id (if departments exist)
-- First check if we can map departments to branches
UPDATE students s
SET branch_id = (
    SELECT b.id 
    FROM branches b
    INNER JOIN departments d ON d.name LIKE CONCAT('%', SUBSTRING_INDEX(b.name, ' ', 1), '%')
    WHERE d.id = s.department_id
    LIMIT 1
)
WHERE branch_id IS NULL AND department_id IS NOT NULL;

-- Alternative: Direct mapping by ID (adjust based on your data)
-- UPDATE students SET branch_id = 1 WHERE department_id = 1; -- IT
-- UPDATE students SET branch_id = 2 WHERE department_id = 2; -- Civil
-- etc.

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email);

-- Step 6: Drop procedure
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

SELECT 'Students table updated successfully!' as status;

