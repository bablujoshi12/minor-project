-- Insert Default Admin and Teachers
-- Passwords will be hashed using bcrypt in backend

USE gpl_lohaghat_db;

-- Note: These passwords need to be hashed using bcrypt in backend
-- Admin: root23371826
-- IT Teacher: it23371826
-- Civil Teacher: civil23371826
-- Electronics Teacher: electronics23371826
-- Pharmacy Teacher: pharmacy23371826
-- Mechanical Teacher: mechanical23371826

-- Get branch IDs first
SET @it_branch = (SELECT id FROM branches WHERE code = 'IT');
SET @civil_branch = (SELECT id FROM branches WHERE code = 'CIVIL');
SET @electronics_branch = (SELECT id FROM branches WHERE code = 'ELECTRONICS');
SET @pharmacy_branch = (SELECT id FROM branches WHERE code = 'PHARMACY');
SET @mechanical_branch = (SELECT id FROM branches WHERE code = 'MECHANICAL');

-- Insert Admin (password will be hashed in backend)
-- Email: vlogsnature05@gmail.com
-- Password: root23371826
INSERT INTO `admins` (`email`, `password`, `name`) VALUES
('vlogsnature05@gmail.com', 'TEMP_PASSWORD_ROOT', 'Root Admin')
ON DUPLICATE KEY UPDATE email=email;

-- Insert Teachers (passwords will be hashed in backend)
-- IT Teacher
INSERT INTO `teachers` (`email`, `password`, `name`, `branch_id`, `phone`) VALUES
('it018@gmail.com', 'TEMP_PASSWORD_IT', 'IT Department Teacher', @it_branch, '9876543210')
ON DUPLICATE KEY UPDATE email=email;

-- Civil Teacher
INSERT INTO `teachers` (`email`, `password`, `name`, `branch_id`, `phone`) VALUES
('civil@gmail.com', 'TEMP_PASSWORD_CIVIL', 'Civil Department Teacher', @civil_branch, '9876543211')
ON DUPLICATE KEY UPDATE email=email;

-- Electronics Teacher
INSERT INTO `teachers` (`email`, `password`, `name`, `branch_id`, `phone`) VALUES
('electronics@gmail.com', 'TEMP_PASSWORD_ELECTRONICS', 'Electronics Department Teacher', @electronics_branch, '9876543212')
ON DUPLICATE KEY UPDATE email=email;

-- Pharmacy Teacher
INSERT INTO `teachers` (`email`, `password`, `name`, `branch_id`, `phone`) VALUES
('pharmacy@gmail.com', 'TEMP_PASSWORD_PHARMACY', 'Pharmacy Department Teacher', @pharmacy_branch, '9876543213')
ON DUPLICATE KEY UPDATE email=email;

-- Mechanical Teacher
INSERT INTO `teachers` (`email`, `password`, `name`, `branch_id`, `phone`) VALUES
('mechanical@gmail.com', 'TEMP_PASSWORD_MECHANICAL', 'Mechanical Department Teacher', @mechanical_branch, '9876543214')
ON DUPLICATE KEY UPDATE email=email;

