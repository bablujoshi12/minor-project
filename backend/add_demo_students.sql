-- Add Demo Student Details for Bablu Joshi and Deepesh Joshi
USE smart_campus;

-- Add demo address field update
ALTER TABLE students ADD COLUMN address TEXT;

-- Update Bablu Joshi (23010120001)
UPDATE students SET 
  address = 'Demo Address: C-123, GPL Campus, IT Hostel, Lohaghat, Uttarakhand'
WHERE roll_no = '23010120001';

-- Update Deepesh Joshi (23010120023)  
UPDATE students SET
  address = 'Demo Address: C-145, GPL Campus, IT Hostel, Lohaghat, Uttarakhand'
WHERE roll_no = '23010120023';

-- Verify students exist
SELECT 
  s.roll_no,
  s.name,
  s.address,
  s.email,
  s.phone,
  s.year,
  d.name as department
FROM students s
LEFT JOIN departments d ON s.department_id = d.id
WHERE s.roll_no IN ('23010120001', '23010120023');

-- Check semester results
SELECT 
  sr.roll_no,
  s.name,
  sr.semester,
  sr.percentage,
  sr.status
FROM semester_results sr
JOIN students s ON sr.student_id = s.id
WHERE sr.roll_no IN ('23010120001', '23010120023')
ORDER BY sr.roll_no, sr.semester;

