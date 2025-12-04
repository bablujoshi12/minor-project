-- Add Semester Results Feature
USE smart_campus;

-- Create semester_results table if not exists
CREATE TABLE IF NOT EXISTS semester_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  roll_no VARCHAR(20) NOT NULL,
  semester INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  status ENUM('pass','fail') DEFAULT 'pass',
  academic_year YEAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE KEY unique_semester (student_id, semester)
);

-- Add Bablu Joshi (23010120001) as IT 3rd Year
INSERT INTO students (roll_no, name, email, phone, department_id, year, admission_date, status)
VALUES ('23010120001', 'Bablu Joshi', 'bablu.joshi@gmail.com', '9876543234', 3, 3, '2022-07-01', 'active')
ON DUPLICATE KEY UPDATE name = 'Bablu Joshi', year = 3, status = 'active';

-- Add Deepesh Joshi (23010120023) as IT 3rd Year  
INSERT INTO students (roll_no, name, email, phone, department_id, year, admission_date, status)
VALUES ('23010120023', 'Deepesh Joshi', 'deepesh.joshi@gmail.com', '9876543235', 3, 3, '2022-07-01', 'active')
ON DUPLICATE KEY UPDATE name = 'Deepesh Joshi', year = 3, status = 'active';

-- Add semester results for Bablu Joshi
SET @bablu_id = (SELECT id FROM students WHERE roll_no = '23010120001');

INSERT INTO semester_results (student_id, roll_no, semester, percentage, status, academic_year)
VALUES 
(@bablu_id, '23010120001', 1, 73.00, 'pass', 2022),
(@bablu_id, '23010120001', 2, 75.00, 'pass', 2023),
(@bablu_id, '23010120001', 3, 85.00, 'pass', 2023),
(@bablu_id, '23010120001', 4, 87.00, 'pass', 2024)
ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), status = VALUES(status);

-- Add semester results for Deepesh Joshi
SET @deepesh_id = (SELECT id FROM students WHERE roll_no = '23010120023');

INSERT INTO semester_results (student_id, roll_no, semester, percentage, status, academic_year)
VALUES 
(@deepesh_id, '23010120023', 1, 73.00, 'pass', 2022),
(@deepesh_id, '23010120023', 2, 75.00, 'pass', 2023),
(@deepesh_id, '23010120023', 3, 85.00, 'pass', 2023),
(@deepesh_id, '23010120023', 4, 87.00, 'pass', 2024)
ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), status = VALUES(status);

-- Verify the data
SELECT 
  s.roll_no,
  s.name,
  d.name as department,
  s.year,
  sr.semester,
  sr.percentage
FROM students s
LEFT JOIN departments d ON s.department_id = d.id
LEFT JOIN semester_results sr ON s.id = sr.student_id
WHERE s.roll_no IN ('23010120001', '23010120023')
ORDER BY s.roll_no, sr.semester;

