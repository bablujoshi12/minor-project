-- Add Bablu Joshi and Deepesh Joshi as IT 3rd Year Students
USE smart_campus;

-- First, check if students already exist
SELECT * FROM students WHERE roll_no IN ('23010120001', '230101223', 'IT23003', 'IT23004');

-- Delete if exists to avoid duplicates
DELETE FROM students WHERE roll_no IN ('23010120001', '230101223', 'IT23003', 'IT23004');

-- Insert Bablu Joshi - IT 3rd Year
INSERT INTO students (roll_no, name, email, phone, department_id, year, admission_date, status) VALUES
('23010120001', 'Bablu Joshi', 'bablu.joshi@gmail.com', '9876543234', 3, 3, '2022-07-01', 'active'),
('IT23003', 'Bablu Joshi', 'bablu.joshi@gmail.com', '9876543234', 3, 3, '2022-07-01', 'active');

-- Insert Deepesh Joshi - IT 3rd Year  
INSERT INTO students (roll_no, name, email, phone, department_id, year, admission_date, status) VALUES
('230101223', 'Deepesh Joshi', 'deepesh.joshi@gmail.com', '9876543235', 3, 3, '2022-07-01', 'active'),
('IT23005', 'Deepesh Joshi', 'deepesh.joshi@gmail.com', '9876543235', 3, 3, '2022-07-01', 'active');

-- Verify the students were added
SELECT s.*, d.name as department_name FROM students s 
LEFT JOIN departments d ON s.department_id = d.id 
WHERE s.name LIKE '%Joshi%' AND s.department_id = 3;

-- Count IT 3rd year students
SELECT COUNT(*) as total_it_3rd_year FROM students WHERE department_id = 3 AND year = 3;
