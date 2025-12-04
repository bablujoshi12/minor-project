const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/assignments'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `assignment-${req.user.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
  }
});

// Upload Assignment (middleware handles file upload)
const uploadAssignment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, subject } = req.body;
    const studentId = req.user.userId;

    // Get student info - userId is the student's id from JWT
    const [students] = await pool.execute('SELECT id, branch_id, year FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];

    await pool.execute(
      `INSERT INTO assignments (student_id, title, description, file_path, branch_id, year, subject, status, submission_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', CURDATE())`,
      [student.id, title, description || '', `/uploads/assignments/${req.file.filename}`, student.branch_id, student.year, subject || 'General']
    );

    res.json({
      success: true,
      message: 'Assignment uploaded successfully',
      file: req.file.filename
    });
  } catch (error) {
    console.error('Upload assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload assignment', error: error.message });
  }
};

// Get Attendance Dashboard
const getAttendanceDashboard = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Get student info - userId is the student's id from JWT
    const [students] = await pool.execute('SELECT id, branch_id, year FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];

    // Get attendance data for last 30 days
    const [attendance] = await pool.execute(
      `SELECT date, status, COUNT(*) as count 
       FROM attendance 
       WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY date, status
       ORDER BY date DESC`,
      [student.id]
    );

    // Calculate total working days and present days
    const [stats] = await pool.execute(
      `SELECT 
         COUNT(DISTINCT date) as total_days,
         SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
         SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
       FROM attendance 
       WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [student.id]
    );

    // Get monthly attendance
    const [monthly] = await pool.execute(
      `SELECT 
         DATE_FORMAT(date, '%Y-%m') as month,
         COUNT(DISTINCT date) as total_days,
         SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days
       FROM attendance 
       WHERE student_id = ?
       GROUP BY DATE_FORMAT(date, '%Y-%m')
       ORDER BY month DESC
       LIMIT 6`,
      [student.id]
    );

    const totalDays = stats[0]?.total_days || 0;
    const presentDays = stats[0]?.present_days || 0;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalDays,
        presentDays,
        absentDays: stats[0]?.absent_days || 0,
        percentage: parseFloat(percentage),
        monthlyData: monthly,
        dailyData: attendance
      }
    });
  } catch (error) {
    console.error('Attendance dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
};

// Get Test Marks (from marks table)
const getTestMarks = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const [students] = await pool.execute('SELECT id FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch from marks table
    const [marks] = await pool.execute(
      `SELECT m.*, 
       (m.marks_obtained / m.max_marks * 100) as percentage,
       DATE_FORMAT(m.created_at, '%Y-%m-%d') as exam_date
       FROM marks m 
       WHERE m.student_id = ? 
       ORDER BY m.created_at DESC`,
      [students[0].id]
    );

    // Format marks to match expected structure
    const formattedMarks = marks.map(m => ({
      id: m.id,
      subject: m.subject,
      marks_obtained: parseFloat(m.marks_obtained),
      total_marks: parseFloat(m.max_marks),
      max_marks: parseFloat(m.max_marks),
      percentage: parseFloat(m.percentage || 0),
      exam_type: m.exam_type || 'Exam',
      test_name: m.exam_type || 'Exam',
      exam_date: m.exam_date || m.created_at,
      semester: m.semester
    }));

    res.json({ success: true, data: formattedMarks });
  } catch (error) {
    console.error('Test marks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch marks', error: error.message });
  }
};

// Get Semester Results (from marks table - aggregated by semester)
const getSemesterResults = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const [students] = await pool.execute('SELECT id FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get marks grouped by semester
    const [results] = await pool.execute(
      `SELECT 
       semester,
       COUNT(*) as total_subjects,
       AVG((marks_obtained / max_marks) * 100) as percentage,
       SUM(marks_obtained) as total_obtained,
       SUM(max_marks) as total_max
       FROM marks 
       WHERE student_id = ? 
       GROUP BY semester
       ORDER BY semester ASC`,
      [students[0].id]
    );

    // Format results
    const formatSemester = (sem) => {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const v = sem % 100;
      return `${sem}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
    };
    
    const formattedResults = results.map(r => ({
      semester: formatSemester(r.semester), // e.g., "3rd", "4th", "5th"
      percentage: parseFloat(r.percentage || 0).toFixed(2),
      status: parseFloat(r.percentage || 0) >= 40 ? 'passed' : 'failed',
      total_subjects: r.total_subjects,
      total_obtained: parseFloat(r.total_obtained || 0),
      total_max: parseFloat(r.total_max || 0)
    }));

    res.json({ success: true, data: formattedResults });
  } catch (error) {
    console.error('Semester results error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
  }
};

// Update Health Info
const updateHealthInfo = async (req, res) => {
  try {
    const { blood_group, physical_problems, health_issues } = req.body;
    const studentId = req.user.userId;

    await pool.execute(
      `UPDATE students 
       SET blood_group = ?, physical_problems = ?, health_issues = ? 
       WHERE id = ?`,
      [blood_group || null, physical_problems || null, health_issues || null, studentId]
    );

    res.json({ success: true, message: 'Health information updated successfully' });
  } catch (error) {
    console.error('Update health error:', error);
    res.status(500).json({ success: false, message: 'Failed to update health info', error: error.message });
  }
};

// Get Student Profile
const getProfile = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const [students] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: students[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
};

// Get Notices
const getNotices = async (req, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    let branchId = null;
    
    // Try to get student's branch - handle if students table doesn't exist
    try {
      const [students] = await pool.execute('SELECT id, branch_id FROM students WHERE id = ?', [studentId]);
      if (students.length === 0) {
        return res.json({ success: true, data: [] }); // Return empty array if student not found
      }
      branchId = students[0].branch_id;
    } catch (studentError) {
      // If students table doesn't exist or query fails, return empty array
      if (studentError.code === 'ER_NO_SUCH_TABLE' || studentError.code === 'ER_BAD_DB_ERROR') {
        return res.json({ success: true, data: [] });
      }
      // If other error, log but still try to get notices
      console.warn('Error fetching student:', studentError.message);
    }

    // Check if notices table exists
    try {
      let query = `SELECT n.*, 
         CASE 
           WHEN n.sender_type = 'admin' THEN a.name
           WHEN n.sender_type = 'teacher' THEN t.name
           ELSE 'System'
         END as sender_name
         FROM notices n
         LEFT JOIN admins a ON n.sender_id = a.id AND n.sender_type = 'admin'
         LEFT JOIN teachers t ON n.sender_id = t.id AND n.sender_type = 'teacher'
         WHERE (n.recipient_type = 'all' OR n.recipient_type = 'student'`;
      
      const params = [];
      
      // Only add branch filter if we have branchId
      if (branchId) {
        query += ` OR (n.recipient_type = 'branch' AND n.branch_id = ?))`;
        params.push(branchId);
      } else {
        query += `)`;
      }
      
      query += ` ORDER BY n.created_at DESC`;
      
      const [notices] = await pool.execute(query, params);
      res.json({ success: true, data: notices || [] });
    } catch (tableError) {
      // If table doesn't exist, return empty array
      if (tableError.code === 'ER_NO_SUCH_TABLE' || tableError.code === 'ER_BAD_DB_ERROR') {
        return res.json({ success: true, data: [] });
      }
      // For other errors, still return empty array to prevent crashes
      console.error('Error fetching notices:', tableError.message);
      return res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Get notices error:', error);
    // Always return success with empty array to prevent frontend crashes
    res.json({ success: true, data: [] });
  }
};

// Get Assignments from Teachers
const getAssignments = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Get student's branch
    const [students] = await pool.execute('SELECT id, branch_id, year FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const student = students[0];

    const [assignments] = await pool.execute(
      `SELECT a.*, t.name as teacher_name
       FROM assignments a
       JOIN teachers t ON a.teacher_id = t.id
       WHERE a.branch_id = ?
       ORDER BY a.created_at DESC`,
      [student.branch_id]
    );

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
};

module.exports = {
  uploadAssignment,
  getAttendanceDashboard,
  getTestMarks,
  getSemesterResults,
  updateHealthInfo,
  getProfile,
  getNotices,
  getAssignments,
  upload // Export multer upload for routes
};

