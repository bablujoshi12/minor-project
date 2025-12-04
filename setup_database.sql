-- Run this file in MySQL to setup the Smart Campus database
-- Command: mysql -u root -p < setup_database.sql
-- Or open in MySQL Workbench and click Execute

SOURCE database/smart_campus.sql;

-- Verify tables were created
SHOW TABLES;

-- Check department data
SELECT * FROM departments;

-- Count students
SELECT COUNT(*) as total_students FROM students;

-- Count faculty
SELECT COUNT(*) as total_faculty FROM faculty;

-- Verify users table
SELECT * FROM users LIMIT 5;

