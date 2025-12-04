-- NSS and NCC Tables for GPL Lohaghat

USE gpl_lohaghat_db;

-- NSS Students Table
CREATE TABLE IF NOT EXISTS nss_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'NSS Registration ID',
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL COMMENT 'District/City',
    father_name VARCHAR(255) NOT NULL,
    mother_name VARCHAR(255) NOT NULL,
    program VARCHAR(50) NOT NULL COMMENT 'Program like IT-I, Civil-1, etc.',
    category VARCHAR(20) NOT NULL COMMENT 'GEN, SC, ST, OBC',
    dob DATE NOT NULL,
    gender ENUM('M', 'F', 'O') NOT NULL DEFAULT 'M',
    email VARCHAR(255),
    phone VARCHAR(20),
    teacher_name VARCHAR(255) DEFAULT 'Sonu Kumar' COMMENT 'NSS Teacher/Coordinator',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_registration (registration_id),
    INDEX idx_status (status),
    INDEX idx_program (program)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NCC Students Table
CREATE TABLE IF NOT EXISTS ncc_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'NCC Registration ID',
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL COMMENT 'District/City',
    father_name VARCHAR(255) NOT NULL,
    mother_name VARCHAR(255) NOT NULL,
    program VARCHAR(50) NOT NULL COMMENT 'Program like IT-I, Civil-1, etc.',
    category VARCHAR(20) NOT NULL COMMENT 'GEN, SC, ST, OBC',
    dob DATE NOT NULL,
    gender ENUM('M', 'F', 'O') NOT NULL DEFAULT 'M',
    email VARCHAR(255),
    phone VARCHAR(20),
    teacher_name VARCHAR(255) DEFAULT 'Vivek Morya' COMMENT 'NCC Teacher/Coordinator',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_registration (registration_id),
    INDEX idx_status (status),
    INDEX idx_program (program)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional - can be inserted via admin panel)
INSERT INTO nss_students (registration_id, name, location, father_name, mother_name, program, category, dob, gender, email, phone, teacher_name) VALUES
('UH0707525002', 'Sanjana', 'Champawat', 'Mr.Jagdish ram', 'Mrs.Bachi devi', 'IT-I', 'SC', '2008-08-05', 'F', 'SanayaSanayakohli@gamil.com', '920689636481', 'Sonu Kumar'),
('UH0707525003', 'Mayank chaturvedi', 'Pithoragarh', 'Mr. Lalit Mohan chaturvedi', 'Mrs. Heera Devi', 'ELEX-I', 'GEN', '2007-07-17', 'M', 'mayankchaturvedi0018@gmail.com', '225885950889', 'Sonu Kumar'),
('UH0707525004', 'Lochan Singh chamyal', 'Almora', 'Mr. Umed singh chamyal', 'Mrs. Deepa Devi', 'Pharmacy-I', 'OBC', '2008-06-26', 'M', 'lochansinghchamyal@gmail.Com', '584901992314', 'Sonu Kumar')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO ncc_students (registration_id, name, location, father_name, mother_name, program, category, dob, gender, email, phone, teacher_name) VALUES
('NCC001', 'Aryan Sharma', 'Champawat', 'Mr. Rajesh Sharma', 'Mrs. Sunita Sharma', 'IT-I', 'GEN', '2007-01-12', 'M', 'aryan.sharma@example.com', '9123456789', 'Vivek Morya'),
('NCC002', 'Sneha Patel', 'Nainital', 'Mr. Amit Patel', 'Mrs. Kavita Patel', 'ELEX-I', 'OBC', '2008-03-25', 'F', 'sneha.patel@example.com', '9123456790', 'Vivek Morya'),
('NCC003', 'Vikash Singh', 'Almora', 'Mr. Mahesh Singh', 'Mrs. Geeta Singh', 'Civil-1', 'SC', '2007-06-08', 'M', 'vikash.singh@example.com', '9123456791', 'Vivek Morya')
ON DUPLICATE KEY UPDATE name=VALUES(name);

