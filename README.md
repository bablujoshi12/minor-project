Smart Campus Portal – Installation & Database Guide

1. Project Overview
This project is a Smart Campus Portal developed for Government Polytechnic Lohaghat.
It is a full-stack web application designed to digitalize campus activities such as:
•	Student, Teacher, Parent, and Admin management
•	Attendance and Marks management
•	Assignment upload and submission
•	Notices and messaging system
•	Department, Faculty, Gallery, Events, and Placement information
Technology Stack
•	Backend: Node.js, Express.js
•	Frontend: React.js
•	Database: MySQL
The system follows a client–server architecture, where the React frontend communicates with the Node/Express backend through REST APIs.
________________________________________
2. System Requirements
Software Requirements
Backend
•	Node.js (v16 or above recommended)
•	npm
•	MySQL Server
•	Windows / Linux / macOS
Frontend
•	Node.js
•	npm
•	Any modern web browser (Chrome, Edge, Firefox)
Database
•	MySQL
•	Default database name used in project: smart_campus
________________________________________
3. Project Structure
project-root/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── config/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
├── database_schema.sql
└── PROJECT_SETUP_SUMMARY.md
•	backend/ contains API logic, database connection, and controllers
•	frontend/ contains React UI and dashboards
•	database_schema.sql contains all database table creation queries
4. Installation Guide
4.1 Clone or Copy Project
git clone <https://github.com/bablujoshi12/minor-project>
cd project-root
Or extract the ZIP file and open the folder in VS Code / Cursor.
________________________________________
4.2 Backend Installation
cd backend
npm install
This installs Express, MySQL driver, JWT, bcrypt, multer, etc.
________________________________________
4.3 Frontend Installation
cd ../frontend
npm install
________________________________________
5. Environment & Configuration
Create a .env file inside the backend folder.
Example .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_campus

PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
Make sure:
•	MySQL service is running
•	Database credentials are correct
________________________________________
6. Database Documentation
Database Type
•	MySQL
Purpose
The database stores:
•	User data (students, teachers, parents, admins)
•	Academic records (attendance, marks, assignments)
•	Notices, messages
•	Homepage content (gallery, events, features)
________________________________________
Major Tables (Summary)
Table Name	Purpose
departments	Department details
branches	Branch information
students	Student records
teachers	Teacher records
parents	Parent login and mapping
assignments	Assignments uploaded by teachers
assignment_submissions	Student submissions
attendance	Daily attendance
marks	Academic marks
notices	Announcements
messages	Internal messaging
gallery_images	Campus gallery
events	Events information

Relationships are maintained using foreign keys such as:
•	students.branch_id → branches.id
•	attendance.student_id → students.id
•	marks.teacher_id → teachers.id
________________________________________
7. Database Setup (SQL File)
Use the provided file database_schema.sql.
Import Database
mysql -u root -p < database_schema.sql
This will:
•	Create database smart_campus
•	Create all required tables
•	Add primary and foreign keys
⚠️ Database name in .env must match the imported database.
________________________________________
8. Running the Project
8.1 Start Backend
cd backend
npm run dev
Backend runs on:
http://localhost:5000
________________________________________
8.2 Start Frontend
cd frontend
npm start
Frontend runs on:
http://localhost:3000
________________________________________
9. Application Usage
User Roles
•	Admin: Manage users, departments, notices
•	Teacher: Attendance, marks, assignments
•	Student: View attendance, marks, submit assignments
•	Parent: Monitor student performance
Access
•	Login through /auth
•	Dashboards:
o	/admin/dashboard
o	/teacher/dashboard
o	/student/dashboard
o	/parent/dashboard
________________________________________
10. Common Errors & Fixes
Port Already in Use
Error: EADDRINUSE :5000
Fix:
Change port in .env or stop running Node processes.
________________________________________
Database Connection Failed
•	Check MySQL service
•	Verify .env credentials
•	Ensure database exists
________________________________________
11. Final Notes
•	This document is generated strictly from project code
•	SQL schema matches only the tables actually used
•	Suitable for college submission and deployment
•	Backend must be started before frontend

