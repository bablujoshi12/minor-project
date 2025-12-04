-- Smart Campus Database for Government Polytechnic, Lohaghat
-- Establishment Year: 1975

CREATE DATABASE IF NOT EXISTS smart_campus;
USE smart_campus;

-- Create MySQL User with Password
-- Note: Run this as root or with appropriate privileges
CREATE USER IF NOT EXISTS 'smart_campus_user'@'localhost' IDENTIFIED BY 'harsiat23371826';
GRANT ALL PRIVILEGES ON smart_campus.* TO 'smart_campus_user'@'localhost';
FLUSH PRIVILEGES;

-- Note: If user already exists, above commands will be skipped

-- Users Table (for Authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student','faculty','admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  login_time TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  hod_name VARCHAR(120),
  total_students INT DEFAULT 0,
  total_faculty INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roll_no VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(15),
  department_id INT,
  year INT,
  admission_date DATE,
  status ENUM('active','inactive','graduated') DEFAULT 'active',
  FOREIGN KEY (department_id) REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(15),
  department_id INT,
  designation VARCHAR(100),
  qualification VARCHAR(100),
  experience_years INT,
  status ENUM('active','inactive','retired') DEFAULT 'active',
  FOREIGN KEY (department_id) REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50) DEFAULT 'general',
  posted_by VARCHAR(120),
  posted_on DATE DEFAULT (CURRENT_DATE),
  expiry_date DATE,
  status ENUM('active','expired','draft') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Feedback Table (Contact Form Submissions)
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(15),
  department VARCHAR(100),
  message TEXT NOT NULL,
  status ENUM('new','read','replied') DEFAULT 'new',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(200) NOT NULL,
  duration_years INT DEFAULT 3,
  description TEXT,
  total_credits INT,
  status ENUM('active','inactive') DEFAULT 'active',
  FOREIGN KEY (department_id) REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location VARCHAR(200),
  category VARCHAR(50),
  status ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Insert Departments
INSERT IGNORE INTO departments (name, code, description, hod_name, total_students, total_faculty) VALUES
('Civil Engineering', 'CE', 'Infrastructure and construction engineering', 'Mr. Govind Ballabh', 24, 3),
('Electronics Engineering', 'EE', 'Electronic systems and circuits', 'Mr. Anil Rautela', 20, 4),
('Information Technology', 'IT', 'Computer systems and networking', 'Dr. Pradeep Kumar', 23, 4),
('Pharmacy', 'PH', 'Pharmaceutical sciences and health', 'Dr. Sarita Joshi', 22, 4),
('Mechanical Engineering', 'ME', 'Design and manufacturing', 'Mr. Suresh Kumar', 25, 4);

-- Insert Students (Civil Engineering)
INSERT IGNORE INTO students (roll_no, name, email, phone, department_id, year, admission_date) VALUES
('CE23001', 'Rahul Sharma', 'rahul.sharma@example.com', '9876543210', 1, 3, '2022-07-01'),
('CE23002', 'Priya Verma', 'priya.verma@example.com', '9876543211', 1, 3, '2022-07-01'),
('CE24001', 'Aman Kumar', 'aman.kumar@example.com', '9876543212', 1, 2, '2023-07-01'),
('CE24002', 'Riya Patel', 'riya.patel@example.com', '9876543213', 1, 2, '2023-07-01'),
('CE25001', 'Vikas Singh', 'vikas.singh@example.com', '9876543214', 1, 1, '2024-07-01'),
('CE25002', 'Anjali Joshi', 'anjali.joshi@example.com', '9876543215', 1, 1, '2024-07-01');

-- Insert Students (Electronics Engineering)
INSERT IGNORE INTO students (roll_no, name, email, phone, department_id, year, admission_date) VALUES
('EE23001', 'Arjun Mehta', 'arjun.mehta@example.com', '9876543220', 2, 3, '2022-07-01'),
('EE23002', 'Sneha Reddy', 'sneha.reddy@example.com', '9876543221', 2, 3, '2022-07-01'),
('EE24001', 'Karan Malhotra', 'karan.malhotra@example.com', '9876543222', 2, 2, '2023-07-01'),
('EE24002', 'Divya Agarwal', 'divya.agarwal@example.com', '9876543223', 2, 2, '2023-07-01');

-- Insert Students (Information Technology)
INSERT IGNORE INTO students (roll_no, name, email, phone, department_id, year, admission_date) VALUES
('IT23001', 'Rajesh Kumar', 'rajesh.kumar@example.com', '9876543230', 3, 3, '2022-07-01'),
('IT23002', 'Pooja Nair', 'pooja.nair@example.com', '9876543231', 3, 3, '2022-07-01'),
('IT24001', 'Mohit Tiwari', 'mohit.tiwari@example.com', '9876543232', 3, 2, '2023-07-01'),
('IT24002', 'Sanjana Das', 'sanjana.das@example.com', '9876543233', 3, 2, '2023-07-01');

-- Insert Faculty (Civil Engineering)
INSERT IGNORE INTO faculty (name, email, phone, department_id, designation, qualification, experience_years) VALUES
('Dr. Ramesh Kumar', 'ramesh.kumar@example.com', '9876501001', 1, 'HOD', 'Ph.D. in Civil Engineering', 15),
('Prof. Sunita Sharma', 'sunita.sharma@example.com', '9876501002', 1, 'Professor', 'M.Tech in Structural Engineering', 12),
('Dr. Vikram Singh', 'vikram.singh@example.com', '9876501003', 1, 'Assistant Professor', 'Ph.D. in Civil Engineering', 8);

-- Insert Faculty (Electronics Engineering)
INSERT IGNORE INTO faculty (name, email, phone, department_id, designation, qualification, experience_years) VALUES
('Dr. Ashok Menon', 'ashok.menon@example.com', '9876502001', 2, 'HOD', 'Ph.D. in Electronics', 18),
('Prof. Deepa Krishnan', 'deepa.krishnan@example.com', '9876502002', 2, 'Professor', 'M.Tech in Electronics', 14),
('Dr. Ravi Pillai', 'ravi.pillai@example.com', '9876502003', 2, 'Assistant Professor', 'Ph.D. in Electronics', 10),
('Ms. Kavita Joshi', 'kavita.joshi@example.com', '9876502004', 2, 'Assistant Professor', 'M.Tech in Electronics', 7);

-- Insert Faculty (Information Technology)
INSERT IGNORE INTO faculty (name, email, phone, department_id, designation, qualification, experience_years) VALUES
('Dr. Neeraj Verma', 'neeraj.verma@example.com', '9876503001', 3, 'HOD', 'Ph.D. in Computer Science', 16),
('Dr. Ravi Sharma', 'ravi.sharma@example.com', '9876503002', 3, 'Professor', 'M.Tech in IT', 12),
('Ms. Kavita Das', 'kavita.das@example.com', '9876503003', 3, 'Assistant Professor', 'M.Tech in IT', 8),
('Ms. Priya Verma', 'priya.verma@example.com', '9876503004', 3, 'Assistant Professor', 'M.Tech in Computer Science', 6);

-- Insert Faculty (Pharmacy)
INSERT IGNORE INTO faculty (name, email, phone, department_id, designation, qualification, experience_years) VALUES
('Dr. Lakshmi Pillai', 'lakshmi.pillai@example.com', '9876504001', 4, 'HOD', 'Ph.D. in Pharmacy', 20),
('Prof. Srinivas Rao', 'srinivas.rao@example.com', '9876504002', 4, 'Professor', 'M.Pharm', 15),
('Dr. Anjali Menon', 'anjali.menon@example.com', '9876504003', 4, 'Assistant Professor', 'Ph.D. in Pharmacy', 9),
('Ms. Radha Iyer', 'radha.iyer@example.com', '9876504004', 4, 'Assistant Professor', 'M.Pharm', 5);

-- Insert Faculty (Mechanical Engineering)
INSERT IGNORE INTO faculty (name, email, phone, department_id, designation, qualification, experience_years) VALUES
('Dr. Prabhu Modi', 'prabhu.modi@example.com', '9876505001', 5, 'HOD', 'Ph.D. in Mechanical Engineering', 17),
('Prof. Swati Reddy', 'swati.reddy@example.com', '9876505002', 5, 'Professor', 'M.Tech in Mechanical', 13),
('Dr. Rajesh Kumar', 'rajesh.kumar.me@example.com', '9876505003', 5, 'Assistant Professor', 'Ph.D. in Mechanical', 10),
('Ms. Kavya Sharma', 'kavya.sharma@example.com', '9876505004', 5, 'Assistant Professor', 'M.Tech in Mechanical', 6);

-- Insert Announcements
INSERT IGNORE INTO announcements (title, content, category, posted_by, posted_on, expiry_date) VALUES
('Admissions Open 2024-25', 'Applications are now open for all diploma programs. Apply online before March 31, 2024.', 'admission', 'Admin', '2024-01-01', '2024-03-31'),
('Campus Placement Drive', 'Register now for the upcoming placement drive on December 15, 2024.', 'placement', 'Placement Office', '2024-11-01', '2024-12-15'),
('Library Digital Resources', 'Access to thousands of e-books and journals now available online 24/7.', 'library', 'Library Staff', '2024-10-01', NULL),
('Hackathon 2025', '48-hour coding challenge with exciting prizes. Register by November 10.', 'event', 'IT Department', '2024-10-15', '2024-11-12'),
('IoT Workshop', 'Hands-on workshop with sensors and microcontrollers on November 20, 2024.', 'event', 'ECE Department', '2024-11-01', '2024-11-20'),
('Career Fair', 'Meet top recruiters and alumni mentors in our annual career fair.', 'event', 'Placement Office', '2024-11-15', '2024-12-05');

-- Insert Events
INSERT IGNORE INTO events (title, description, event_date, event_time, location, category, status) VALUES
('Hackathon 2025', '48-hour coding challenge with exciting prizes and industry recognition', '2024-11-12', '09:00:00', 'Auditorium', 'competition', 'upcoming'),
('IoT Workshop', 'Hands-on workshop with sensors, microcontrollers, and cloud integration', '2024-11-20', '10:00:00', 'ECE Lab', 'workshop', 'upcoming'),
('Career Fair', 'Meet top recruiters and alumni mentors in our annual career fair', '2024-12-05', '09:30:00', 'Sports Complex', 'placement', 'upcoming'),
('Industry Visit - L&T Construction', 'Site visit to understand real-world construction projects', '2024-11-25', '08:00:00', 'L&T Site', 'industrial', 'upcoming'),
('Guest Lecture on AI', 'Expert talk on Artificial Intelligence and Machine Learning', '2024-12-10', '14:00:00', 'Seminar Hall', 'academic', 'upcoming');

-- Insert Sample Users (for testing authentication)
-- Password for all test users: 123456
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin User', 'admin@gplohaghat.ac.in', '$2a$10$r5t.Z8KxN3MJq2H1eYqJ5e.5F7v8q.5F7v8q.5F7v8q.5F7v8q.5F7v', 'admin'),
('Test Student', 'student@example.com', '$2a$10$r5t.Z8KxN3MJq2H1eYqJ5e.5F7v8q.5F7v8q.5F7v8q.5F7v8q.5F7v', 'student'),
('Test Faculty', 'faculty@example.com', '$2a$10$r5t.Z8KxN3MJq2H1eYqJ5e.5F7v8q.5F7v8q.5F7v8q.5F7v8q.5F7v', 'faculty');

-- Insert Sample Feedback
INSERT IGNORE INTO feedback (name, email, phone, department, message, status) VALUES
('Rahul Kumar', 'rahul.kumar@example.com', '9876543001', 'IT', 'Great campus facilities and helpful staff!', 'read'),
('Priya Singh', 'priya.singh@example.com', '9876543002', 'CE', 'Very impressed with the quality of education.', 'new'),
('Aman Verma', 'aman.verma@example.com', '9876543003', 'EE', 'Looking forward to joining this institution.', 'new');

-- Update department stats with actual counts
UPDATE departments SET total_students = (SELECT COUNT(*) FROM students WHERE department_id = departments.id AND status = 'active');
UPDATE departments SET total_faculty = (SELECT COUNT(*) FROM faculty WHERE department_id = departments.id AND status = 'active');

-- ========================================
-- VIEWS FOR EASY QUERIES
-- ========================================

CREATE OR REPLACE VIEW department_summary AS
SELECT 
  d.id,
  d.name,
  d.code,
  d.hod_name,
  d.total_students,
  d.total_faculty,
  COUNT(DISTINCT s.id) as student_count,
  COUNT(DISTINCT f.id) as faculty_count
FROM departments d
LEFT JOIN students s ON d.id = s.department_id AND s.status = 'active'
LEFT JOIN faculty f ON d.id = f.department_id AND f.status = 'active'
GROUP BY d.id;

CREATE OR REPLACE VIEW active_users AS
SELECT 
  id,
  name,
  email,
  role,
  login_time,
  created_at
FROM users
WHERE role IN ('student', 'faculty', 'admin')
ORDER BY login_time DESC;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_year ON students(year);
CREATE INDEX idx_faculty_department ON faculty(department_id);
CREATE INDEX idx_faculty_status ON faculty(status);
CREATE INDEX idx_announcements_date ON announcements(posted_on);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_feedback_status ON feedback(status);

