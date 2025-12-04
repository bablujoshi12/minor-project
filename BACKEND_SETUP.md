# Backend Setup Guide - GPL Lohaghat Smart Campus

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### Create Database
```sql
CREATE DATABASE gpl_lohaghat;
```

#### Import Schema
```bash
mysql -u root -p gpl_lohaghat < backend/database/schema.sql
```

Or manually run the SQL file in MySQL:
```bash
mysql -u root -p < backend/database/schema.sql
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gpl_lohaghat

# JWT Secret (Change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

### 4. Create Uploads Folder

The uploads folder should already be created, but if not:

```bash
mkdir -p backend/uploads/assignments
```

### 5. Start Backend Server

```bash
cd backend
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 6. Install Frontend Dependencies

```bash
cd ..
npm install
```

### 7. Start Frontend

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Student Routes (Requires Authentication)
- `GET /api/student/profile` - Get student profile
- `POST /api/student/upload-assignment` - Upload assignment
- `GET /api/student/attendance-dashboard` - Get attendance data
- `GET /api/student/test-marks` - Get test marks
- `GET /api/student/semester-results` - Get semester results
- `PUT /api/student/health-info` - Update health information

### Teacher Routes (Requires Authentication)
- `GET /api/teacher/students` - Get student list (with branch/year filters)
- `GET /api/teacher/assignments` - Get assignments (with filters)
- `PUT /api/teacher/assignments` - Update assignment (marks, feedback)
- `GET /api/teacher/attendance-graph` - Get attendance graph data
- `POST /api/teacher/send-message` - Send message to student/parent
- `GET /api/teacher/messages` - Get messages

### Parent Routes (Requires Authentication)
- `GET /api/parent/children` - Get children list
- `POST /api/parent/select-child` - Select child to view
- `GET /api/parent/child-attendance` - Get child attendance
- `GET /api/parent/child-assignments` - Get child assignments
- `GET /api/parent/child-marks` - Get child test marks
- `GET /api/parent/child-semester-results` - Get child semester results
- `POST /api/parent/send-message` - Send message to teacher
- `GET /api/parent/messages` - Get messages

## Testing

### Register a Student
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student",
    "roll_no": "23010120023",
    "section": "A",
    "branch": "IT",
    "year": 3
  }'
```

### Login as Student
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "roll_no": "23010120023",
    "section": "A",
    "password": "password123"
  }'
```

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database `gpl_lohaghat` exists

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill process using port 5000

### File Upload Issues
- Ensure `backend/uploads/assignments` folder exists
- Check folder permissions

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Set up SSL/HTTPS
5. Use process manager like PM2
6. Configure CORS properly for your domain
