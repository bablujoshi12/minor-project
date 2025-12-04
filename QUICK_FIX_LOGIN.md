# 🔧 Quick Fix: सभी Panels Login Issues

## Steps to Fix All Login Issues:

### Step 1: Database Tables Create करें

```bash
# MySQL में login करें
mysql -u root -p

# Database select करें
USE gpl_lohaghat_db;

# Schema file run करें
SOURCE database/complete_system_schema.sql;
```

या manually:
```sql
USE gpl_lohaghat_db;

-- Admins table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Branches table
CREATE TABLE IF NOT EXISTS `branches` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert branches
INSERT IGNORE INTO `branches` (`name`, `code`) VALUES
('Information Technology', 'IT'),
('Civil Engineering', 'CIVIL'),
('Electronics Engineering', 'ELECTRONICS'),
('Pharmacy', 'PHARMACY'),
('Mechanical Engineering', 'MECHANICAL');

-- Teachers table
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `branch_id` INT(11) NOT NULL,
  `phone` VARCHAR(20),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Students table
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `roll_no` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(255),
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `branch_id` INT(11) NOT NULL,
  `year` INT(11) DEFAULT 1,
  `section` VARCHAR(10),
  `dob` DATE,
  `phone` VARCHAR(20),
  `father_name` VARCHAR(255),
  `mother_name` VARCHAR(255),
  `parent_email` VARCHAR(255),
  `parent_name` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parents table
CREATE TABLE IF NOT EXISTS `parents` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `student_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 2: Default Users Setup करें

```bash
cd backend
node scripts/setup_default_users.js
```

### Step 3: Backend Server Restart करें

```bash
# पहले running server को stop करें (Ctrl+C)
# फिर:
cd backend
node server.js
```

### Step 4: Test करें

1. **Admin Login:**
   - Email: `vlogsnature05@gmail.com`
   - Password: `root23371826`

2. **Teacher Login:**
   - Email: `it018@gmail.com`
   - Password: `it23371826`

3. **Student Signup:** Student panel से signup करें

4. **Parent Login:** Student signup के बाद parent email से

## ✅ Fixed Issues:

1. ✅ Auth routes properly mounted in server.js
2. ✅ Database connection fixed (using pool.query)
3. ✅ Login logic fixed for all panels
4. ✅ Default users setup script ready

## 🔍 Check करें:

- Browser console में errors check करें
- Network tab में API calls check करें
- Backend terminal में logs check करें



