# Smart Campus Backend API

Backend API for Government Polytechnic, Lohaghat Smart Campus Portal.

## Tech Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Project Structure
```
backend/
├── config/
│   └── database.js       # Database connection
├── controllers/
│   ├── authController.js
│   ├── departmentController.js
│   ├── studentController.js
│   ├── facultyController.js
│   ├── announcementController.js
│   └── feedbackController.js
├── middleware/
│   └── auth.js           # JWT authentication
├── routes/
│   ├── auth.js
│   ├── departments.js
│   ├── students.js
│   ├── faculty.js
│   ├── announcements.js
│   └── feedback.js
├── server.js              # Main server file
├── package.json
└── .env                   # Environment variables
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID

### Students
- `GET /api/students` - Get all students
- `GET /api/students/department/:id` - Get students by department

### Faculty
- `GET /api/faculty` - Get all faculty
- `GET /api/faculty/department/:id` - Get faculty by department

### Announcements
- `GET /api/announcements` - Get all announcements

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback (admin)

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
mysql -u root -p < ../database/smart_campus.sql

# Copy .env file
# Update database credentials in .env

# Start server
npm start

# Development mode (with auto-reload)
npm run dev
```

## Environment Variables

Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_campus
PORT=5000
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

## Database

The database schema includes:
- **users** - User accounts and authentication
- **departments** - Academic departments (5 departments)
- **students** - Student records
- **faculty** - Faculty/staff records
- **announcements** - Campus announcements
- **feedback** - Contact form submissions
- **courses** - Course information
- **events** - Campus events

Run the SQL file to setup:
```bash
mysql -u root -p < database/smart_campus.sql
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

## Authentication

Protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## License

MIT

