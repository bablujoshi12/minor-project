-- ========== SAMPLE ATTENDANCE AND MARKS DATA ==========
-- This script inserts 80% attendance and good marks for ALL students
-- Run this after students, teachers, and branches are set up

-- IMPORTANT: Select your database first
USE smart_campus;

-- ========== CREATE TABLES IF NOT EXISTS ==========
-- Create attendance table if it doesn't exist
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
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL,
  INDEX `idx_student` (`student_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_branch` (`branch_id`),
  UNIQUE KEY `unique_attendance` (`student_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create marks table if it doesn't exist
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
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL,
  INDEX `idx_student` (`student_id`),
  INDEX `idx_semester` (`semester`),
  INDEX `idx_branch` (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== INSERT 80% ATTENDANCE FOR ALL STUDENTS ==========
-- Each student gets attendance for last 30 days with exactly 80% presence (24 present, 6 absent)

INSERT INTO attendance (student_id, date, status, branch_id, teacher_id, remarks)
SELECT 
    s.id,
    DATE_SUB(CURDATE(), INTERVAL n.day_num DAY) as date,
    CASE 
        -- Exactly 80% attendance: Absent on days 5, 10, 15, 20, 25, 30 (6 days = 20% absent)
        -- Present on all other 24 days (80% present)
        WHEN n.day_num IN (5, 10, 15, 20, 25, 30) THEN 'absent'
        ELSE 'present'
    END as status,
    s.branch_id,
    (SELECT t.id FROM teachers t WHERE t.branch_id = s.branch_id LIMIT 1) as teacher_id,
    NULL as remarks
FROM students s
CROSS JOIN (
    SELECT 1 as day_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
    UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
    UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
    UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
) n
WHERE NOT EXISTS (
    SELECT 1 FROM attendance a 
    WHERE a.student_id = s.id 
    AND a.date = DATE_SUB(CURDATE(), INTERVAL n.day_num DAY)
);

-- ========== INSERT GOOD MARKS FOR ALL STUDENTS ==========
-- Each student gets 6-8 marks with good scores (70-95 out of 100)

-- Method 1: Insert marks for each student with different subjects (3rd & 4th Semester only)
INSERT INTO marks (student_id, semester, subject, marks_obtained, max_marks, branch_id, teacher_id, exam_type)
SELECT 
    s.id as student_id,
    CASE 
        -- Always insert 3rd and 4th semester marks (regardless of year)
        WHEN MOD(m.mark_num - 1, 2) = 0 THEN 3 -- 3rd semester
        ELSE 4 -- 4th semester
    END as semester,
    ELT(1 + MOD((s.id * 7 + m.mark_num), 10),
        'Data Structures',
        'Database Systems',
        'Web Development',
        'Operating Systems',
        'Computer Networks',
        'Software Engineering',
        'Machine Learning',
        'Digital Electronics',
        'Mathematics',
        'English'
    ) as subject,
    FLOOR(70 + RAND() * 26) as marks_obtained, -- Good marks: 70-95 (range of 26)
    100 as max_marks,
    s.branch_id,
    (SELECT t.id FROM teachers t WHERE t.branch_id = s.branch_id LIMIT 1) as teacher_id,
    ELT(1 + MOD(m.mark_num - 1, 5),
        'Exam',
        'Mid-Term',
        'Unit Test',
        'Practical',
        'Assignment'
    ) as exam_type
FROM students s
CROSS JOIN (
    SELECT 1 as mark_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
) m
WHERE NOT EXISTS (
    SELECT 1 FROM marks mk 
    WHERE mk.student_id = s.id 
    AND mk.semester = CASE 
        WHEN s.year = 1 THEN 1 + MOD(m.mark_num - 1, 2)
        WHEN s.year = 2 THEN 3 + MOD(m.mark_num - 1, 2)
        WHEN s.year = 3 THEN 5 + MOD(m.mark_num - 1, 2)
        ELSE 1 + MOD(m.mark_num - 1, 8)
    END
    AND mk.subject = ELT(1 + MOD((s.id * 7 + m.mark_num), 10), 'Data Structures', 'Database Systems', 'Web Development', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Machine Learning', 'Digital Electronics', 'Mathematics', 'English')
    AND mk.exam_type = ELT(1 + MOD(m.mark_num - 1, 5), 'Exam', 'Mid-Term', 'Unit Test', 'Practical', 'Assignment')
)
LIMIT 10000; -- Large limit to ensure all students get marks

-- ========== VERIFICATION QUERIES ==========
-- Run these after inserting to verify the data:

-- Check attendance percentage for each student:
-- SELECT 
--     s.id,
--     s.name,
--     s.roll_no,
--     COUNT(a.id) as total_days,
--     SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
--     SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
--     ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as attendance_percentage
-- FROM students s
-- LEFT JOIN attendance a ON s.id = a.student_id
-- GROUP BY s.id, s.name, s.roll_no
-- ORDER BY s.id;

-- Check average marks for each student:
-- SELECT 
--     s.id,
--     s.name,
--     s.roll_no,
--     COUNT(m.id) as total_marks,
--     AVG(m.marks_obtained) as avg_marks,
--     MIN(m.marks_obtained) as min_marks,
--     MAX(m.marks_obtained) as max_marks
-- FROM students s
-- LEFT JOIN marks m ON s.id = m.student_id
-- GROUP BY s.id, s.name, s.roll_no
-- ORDER BY s.id;

-- ========== NOTES ==========
-- 1. Attendance: All students get exactly 80% attendance (24 present, 6 absent out of 30 days)
-- 2. Marks: All students get 6-8 marks with scores between 70-95
-- 3. Each student gets marks across different subjects and semesters based on their year
-- 4. The script works for any number of students
-- 5. Make sure teachers exist for each branch before running
-- 6. Run the verification queries to confirm the data is correct
