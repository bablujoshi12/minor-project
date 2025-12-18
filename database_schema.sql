-- Database schema for GPL Lohaghat Smart Campus Portal
-- Derived strictly from table and column usage in the codebase

CREATE DATABASE IF NOT EXISTS smart_campus;
USE smart_campus;

-- ===================== CORE MASTER TABLES =====================

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  hod_name VARCHAR(255) NULL,
  total_students INT NULL,
  total_faculty INT NULL
);

CREATE TABLE IF NOT EXISTS branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  branch_id INT NULL,
  user_id INT NULL,
  CONSTRAINT fk_teachers_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roll_no VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  branch_id INT NULL,
  department_id INT NULL,
  year INT NULL,
  semester INT NULL,
  section VARCHAR(50) NULL,
  father_name VARCHAR(255) NULL,
  mother_name VARCHAR(255) NULL,
  dob DATE NULL,
  sex VARCHAR(20) NULL,
  category VARCHAR(100) NULL,
  parent_email VARCHAR(255) NULL,
  parent_phone VARCHAR(50) NULL,
  blood_group VARCHAR(20) NULL,
  physical_problems TEXT NULL,
  health_issues TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_students_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
      ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS parents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NULL,
  name VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  student_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_parents_student
    FOREIGN KEY (student_id) REFERENCES students(id)
      ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NULL,
  qualification VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  department_id INT NULL,
  status VARCHAR(50) NULL,
  CONSTRAINT fk_faculty_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
      ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS department_faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  name VARCHAR(255) NULL,
  designation VARCHAR(255) NULL,
  is_hod TINYINT(1) NOT NULL DEFAULT 0,
  display_order INT NULL,
  CONSTRAINT fk_dept_faculty_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
      ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS department_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  year INT NULL,
  student_names TEXT NULL,
  student_count INT NULL,
  CONSTRAINT fk_dept_students_department
    FOREIGN KEY (department_id) REFERENCES departments(id)
      ON UPDATE CASCADE ON DELETE CASCADE
);

-- ===================== GALLERY & HOMEPAGE CONTENT =====================

CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NULL,
  alt_text VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  icon VARCHAR(100) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  background_gradient VARCHAR(255) NULL,
  bg_gradient VARCHAR(255) NULL,
  link VARCHAR(512) NULL,
  link_url VARCHAR(512) NULL,
  display_order INT NULL,
  is_active TINYINT(1) NULL
);

CREATE TABLE IF NOT EXISTS homepage_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  icon VARCHAR(100) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  bg_gradient VARCHAR(255) NULL,
  link_url VARCHAR(512) NULL,
  display_order INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  display_date DATE NULL,
  event_date DATE NULL,
  location VARCHAR(255) NULL,
  image_url TEXT NULL,
  category VARCHAR(100) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NULL
);

CREATE TABLE IF NOT EXISTS homepage_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  date DATE NULL,
  location VARCHAR(255) NULL,
  image_url TEXT NULL,
  link_url VARCHAR(512) NULL,
  display_order INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS placement_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  percentage DECIMAL(5,2) NULL,
  package_range VARCHAR(255) NULL,
  companies TEXT NULL,
  sectors TEXT NULL
);

-- ===================== ASSIGNMENTS & ATTENDANCE =====================

CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NULL,
  teacher_id INT NULL,
  branch_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  subject VARCHAR(255) NULL,
  file_path TEXT NULL,
  file_url TEXT NULL,
  status VARCHAR(50) NULL,
  due_date DATE NULL,
  marks INT NULL,
  feedback TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignments_student
    FOREIGN KEY (student_id) REFERENCES students(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_assignments_teacher
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_assignments_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_path TEXT NULL,
  file_url TEXT NULL,
  submission_date DATETIME NULL,
  status VARCHAR(50) NULL,
  marks INT NULL,
  feedback TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_assignment_student UNIQUE (assignment_id, student_id),
  CONSTRAINT fk_asgn_sub_assignment
    FOREIGN KEY (assignment_id) REFERENCES assignments(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_asgn_sub_student
    FOREIGN KEY (student_id) REFERENCES students(id)
      ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  branch_id INT NULL,
  teacher_id INT NULL,
  remarks TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_attendance_student_date UNIQUE (student_id, date),
  CONSTRAINT fk_attendance_student
    FOREIGN KEY (student_id) REFERENCES students(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_attendance_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_attendance_teacher
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  semester INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  marks_obtained DECIMAL(6,2) NOT NULL,
  max_marks DECIMAL(6,2) NOT NULL DEFAULT 100,
  branch_id INT NULL,
  teacher_id INT NULL,
  exam_type VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_marks_student
    FOREIGN KEY (student_id) REFERENCES students(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_marks_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_marks_teacher
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      ON UPDATE CASCADE ON DELETE SET NULL
);

-- ===================== MESSAGING & NOTICES =====================

CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sender_type VARCHAR(50) NULL,
  sender_id INT NULL,
  recipient_type VARCHAR(50) NULL,
  branch_id INT NULL,
  priority VARCHAR(50) NULL,
  created_by INT NULL,
  created_by_role VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notices_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_id INT NOT NULL,
  from_role VARCHAR(50) NOT NULL,
  to_id INT NOT NULL,
  to_role VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_from_user
    FOREIGN KEY (from_id) REFERENCES users(id)
      ON UPDATE CASCADE ON DELETE CASCADE
);


