# Smart Campus Portal - Government Polytechnic, Lohaghat

## Project Overview
A responsive web portal/chatbot representing a Smart Campus System for Government Polytechnic, Lohaghat. The portal serves as an informative and interactive platform for students, faculty, and visitors.

## Requirements Fulfilled ✅
- ✅ Responsive website (Desktop + Mobile view)
- ✅ HTML5, CSS3, JavaScript (React-based)
- ✅ Three interconnected pages (Home, About, Contact)
- ✅ Forms (Contact form, Login/Registration)
- ✅ Icons, illustrations, and enhanced user experience
- ✅ Database file with tables and sample data

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```
The app will open at `http://localhost:3000`

### 3. Database Setup
Import the database file `database/smart_campus.sql` into MySQL Workbench:
1. Open MySQL Workbench
2. Create a new connection
3. Open the SQL file: `database/smart_campus.sql`
4. Execute the script to create tables and insert sample data

## Project Structure
```
src/
├── components/
│   ├── Home.js       # Home page with campus overview
│   ├── Services.js   # About/Services page with departments
│   ├── Contact.js    # Contact page with feedback form
│   └── Auth.js       # Login/Registration forms
├── App.js            # Main app with routing
└── App.css           # Global styles

database/
└── smart_campus.sql  # Database schema and sample data
```

## Features
- **Home**: Welcome section, campus stats, features, and events
- **About**: Vision, mission, departments, and campus services
- **Contact**: Feedback form and campus information
- **Login/Register**: Authentication forms
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used
- React 19.2.0
- React Router DOM
- HTML5, CSS3, JavaScript
- MySQL (for database)

## Database Tables
- `departments` - Department information
- `students` - Student records
- `faculty` - Faculty information
- `announcements` - Campus announcements
- `feedback` - Contact form submissions
- `users` - User authentication

## Contact
Government Polytechnic, Lohaghat
Champawat, Uttarakhand, 262524

