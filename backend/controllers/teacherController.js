const pool = require('../config/database');

// Get Student List (branch and year wise)
const getStudentList = async (req, res) => {
  try {
    const { branch, year } = req.query;
    const teacherId = req.user.userId;

    // Get teacher's branch_id
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const teacherBranchId = teachers[0].branch_id;

    // Get branch code from branches table for display
    const [branchInfo] = await pool.execute('SELECT code, name FROM branches WHERE id = ?', [teacherBranchId]);
    const branchCode = branchInfo[0]?.code || '';
    const branchName = branchInfo[0]?.name || '';

    let query = `
      SELECT s.id, s.roll_no, s.name, s.section, s.year, s.email, s.phone,
             s.branch_id, b.code as branch_code, b.name as branch_name
      FROM students s
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE s.branch_id = ?
    `;
    let params = [teacherBranchId]; // Filter by teacher's branch

    if (branch) {
      // If branch filter provided (by code), find branch_id
      const [branchFilter] = await pool.execute('SELECT id FROM branches WHERE code = ?', [branch]);
      if (branchFilter.length > 0) {
        params[0] = branchFilter[0].id; // Use filtered branch_id
      }
    }

    if (year) {
      query += ' AND s.year = ?';
      params.push(year);
    }

    query += ' ORDER BY s.roll_no ASC';

    const [students] = await pool.execute(query, params);

    // Format students data to include branch info
    const formattedStudents = students.map(s => ({
      id: s.id,
      roll_no: s.roll_no,
      name: s.name,
      section: s.section,
      branch: s.branch_code || s.branch_id, // Use branch code or ID as fallback
      branch_name: s.branch_name || '',
      branch_id: s.branch_id,
      year: s.year,
      email: s.email,
      phone: s.phone
    }));

    res.json({ success: true, data: formattedStudents });
  } catch (error) {
    console.error('Get student list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

// Get Assignments (with filters)
const getAssignments = async (req, res) => {
  try {
    const { branch, year, status, student_id } = req.query;
    const teacherId = req.user.userId;

    // Get teacher's branch_id
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const teacherBranchId = teachers[0].branch_id;

    let query = `
      SELECT a.*, s.name as student_name, s.roll_no, s.year, b.code as branch_code, b.name as branch_name
      FROM assignments a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE a.branch_id = ?
    `;
    let params = [teacherBranchId]; // Filter by teacher's branch

    if (branch) {
      // If branch filter provided (by code), find branch_id
      const [branchFilter] = await pool.execute('SELECT id FROM branches WHERE code = ?', [branch]);
      if (branchFilter.length > 0) {
        params[0] = branchFilter[0].id; // Use filtered branch_id
      }
    }

    if (year) {
      query += ' AND s.year = ?';
      params.push(year);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }

    query += ' ORDER BY a.created_at DESC';

    const [assignments] = await pool.execute(query, params);

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    // If assignments table doesn't exist yet, return empty list instead of 500
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
};

// Check/Update Assignment (marks and feedback)
const updateAssignment = async (req, res) => {
  try {
    const { assignment_id, marks, feedback, status } = req.body;

    await pool.execute(
      `UPDATE assignments 
       SET marks = ?, feedback = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [marks || null, feedback || null, status || 'checked', assignment_id]
    );

    res.json({ success: true, message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update assignment', error: error.message });
  }
};

// Get Attendance Graph Data
const getAttendanceGraph = async (req, res) => {
  try {
    const { branch, year, date } = req.query;
    const teacherId = req.user.userId;

    // Get teacher's branch_id
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    let teacherBranchId = teachers[0].branch_id;

    // If branch filter provided, find branch_id
    if (branch) {
      const [branchFilter] = await pool.execute('SELECT id FROM branches WHERE code = ?', [branch]);
      if (branchFilter.length > 0) {
        teacherBranchId = branchFilter[0].id;
      }
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get total students in branch/year
    let studentQuery = `
      SELECT COUNT(*) as total FROM students WHERE branch_id = ?
    `;
    let params = [teacherBranchId];

    if (year) {
      studentQuery += ' AND year = ?';
      params.push(year);
    }

    const [totalResult] = await pool.execute(studentQuery, params);
    const totalStudents = totalResult[0].total || 0;

    // Get attendance for the date
    let attendanceQuery = `
      SELECT 
        COUNT(DISTINCT a.student_id) as present_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count_detailed
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE DATE(a.date) = ? AND s.branch_id = ?
    `;
    let attendanceParams = [targetDate, teacherBranchId];

    if (year) {
      attendanceQuery += ' AND s.year = ?';
      attendanceParams.push(year);
    }

    const [attendance] = await pool.execute(attendanceQuery, attendanceParams);

    // Get daily attendance for last 30 days
    const [dailyData] = await pool.execute(
      `SELECT 
         DATE(a.date) as date,
         COUNT(DISTINCT a.student_id) as present_students
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE a.status = 'present' 
         AND s.branch_id = ?
         AND a.date >= DATE_SUB(?, INTERVAL 30 DAY)
       GROUP BY DATE(a.date)
       ORDER BY date ASC`,
      [teacherBranchId, targetDate]
    );

    const presentCount = attendance[0]?.present_count_detailed || 0;
    const absentCount = totalStudents - presentCount;

    res.json({
      success: true,
      data: {
        date: targetDate,
        totalStudents,
        presentStudents: presentCount,
        absentStudents: absentCount,
        presentPercentage: totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : 0,
        dailyData: dailyData
      }
    });
  } catch (error) {
    console.error('Attendance graph error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance graph', error: error.message });
  }
};

// Send Message to Student/Parent
const sendMessage = async (req, res) => {
  try {
    const { to_id, to_role, subject, message } = req.body;
    const fromId = req.user.userId;
    const fromRole = req.user.role;

    if (!to_id || !to_role || !message) {
      return res.status(400).json({ success: false, message: 'to_id, to_role, and message are required' });
    }

    await pool.execute(
      `INSERT INTO messages (from_id, from_role, to_id, to_role, subject, message) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fromId, fromRole, to_id, to_role, subject || '', message]
    );

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// Get Messages
const getMessages = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    const [messages] = await pool.execute(
      `SELECT m.*, u.email as from_email 
       FROM messages m
       JOIN users u ON m.from_id = u.id
       WHERE m.to_id = (SELECT id FROM teachers WHERE user_id = ?)
       ORDER BY m.created_at DESC`,
      [teacherId]
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// Send Notice
const sendNotice = async (req, res) => {
  try {
    const { title, message, recipient_type } = req.body;
    const teacherId = req.user.userId;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    const branchId = teachers[0]?.branch_id || null;

    const [result] = await pool.execute(
      `INSERT INTO notices (title, message, sender_type, sender_id, recipient_type, branch_id, created_at) 
       VALUES (?, ?, 'teacher', ?, ?, ?, NOW())`,
      [title, message, teacherId, recipient_type || 'student', branchId]
    );

    res.json({ success: true, message: 'Notice sent successfully', data: { noticeId: result.insertId } });
  } catch (error) {
    console.error('Send notice error:', error);
    res.status(500).json({ success: false, message: 'Failed to send notice' });
  }
};

// Get Notices
const getNotices = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const [notices] = await pool.execute(
      `SELECT n.*, t.name as sender_name
       FROM notices n
       LEFT JOIN teachers t ON n.sender_id = t.id AND n.sender_type = 'teacher'
       WHERE (n.sender_id = ? AND n.sender_type = 'teacher')
       ORDER BY n.created_at DESC`,
      [teacherId]
    );
    res.json({ success: true, data: notices });
  } catch (error) {
    console.error('Get notices error:', error);
    // If notices table doesn't exist, just return empty array rather than 500
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch notices' });
  }
};

// Create Assignment (POST)
const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, due_date } = req.body;
    const teacherId = req.user.userId;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const branchId = teachers[0].branch_id;

    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : null;

    const [result] = await pool.execute(
      `INSERT INTO assignments (title, description, file_url, teacher_id, branch_id, due_date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [title, description || '', fileUrl, teacherId, branchId, due_date || null]
    );

    res.json({ success: true, message: 'Assignment created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create assignment' });
  }
};

// Insert Attendance (Single or Bulk)
const insertAttendance = async (req, res) => {
  try {
    const { student_id, date, status, remarks, students } = req.body; // students is array for bulk insert
    const teacherId = req.user.userId;

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const branchId = teachers[0].branch_id;

    // Bulk insert
    if (students && Array.isArray(students) && students.length > 0) {
      const attendanceData = [];
      for (const student of students) {
        if (student.student_id && student.date && student.status) {
          // Get student's branch_id if not provided
          const [studentData] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [student.student_id]);
          const studentBranchId = studentData[0]?.branch_id || branchId;
          
          attendanceData.push([
            student.student_id,
            student.date,
            student.status,
            studentBranchId,
            teacherId,
            student.remarks || null
          ]);
        }
      }

      if (attendanceData.length > 0) {
        // Build dynamic VALUES clause for bulk insert
        const placeholders = attendanceData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const values = attendanceData.flat();
        await pool.execute(
          `INSERT INTO attendance (student_id, date, status, branch_id, teacher_id, remarks) 
           VALUES ${placeholders} 
           ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), teacher_id = VALUES(teacher_id)`,
          values
        );
        return res.json({ success: true, message: `Attendance recorded for ${attendanceData.length} students` });
      }
    }

    // Single insert
    if (student_id && date && status) {
      // Get student's branch_id if not provided
      const [studentData] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [student_id]);
      const studentBranchId = studentData[0]?.branch_id || branchId;

      await pool.execute(
        `INSERT INTO attendance (student_id, date, status, branch_id, teacher_id, remarks) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), teacher_id = VALUES(teacher_id)`,
        [student_id, date, status, studentBranchId, teacherId, remarks || null]
      );

      return res.json({ success: true, message: 'Attendance recorded successfully' });
    }

    return res.status(400).json({ success: false, message: 'Invalid data. Provide student_id, date, status or students array' });
  } catch (error) {
    console.error('Insert attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to insert attendance', error: error.message });
  }
};

// Insert Marks
const insertMarks = async (req, res) => {
  try {
    const { student_id, semester, subject, marks_obtained, max_marks = 100, exam_type, marks } = req.body; // marks is array for bulk insert
    const teacherId = req.user.userId;

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const branchId = teachers[0].branch_id;

    // Bulk insert
    if (marks && Array.isArray(marks) && marks.length > 0) {
      const marksData = [];
      for (const mark of marks) {
        if (mark.student_id && mark.semester && mark.subject && mark.marks_obtained !== undefined) {
          // Get student's branch_id if not provided
          const [studentData] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [mark.student_id]);
          const studentBranchId = studentData[0]?.branch_id || branchId;

          marksData.push([
            mark.student_id,
            mark.semester,
            mark.subject,
            mark.marks_obtained,
            mark.max_marks || 100,
            studentBranchId,
            teacherId,
            mark.exam_type || 'Exam'
          ]);
        }
      }

      if (marksData.length > 0) {
        // Build dynamic VALUES clause for bulk insert
        const placeholders = marksData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const values = marksData.flat();
        await pool.execute(
          `INSERT INTO marks (student_id, semester, subject, marks_obtained, max_marks, branch_id, teacher_id, exam_type) 
           VALUES ${placeholders}`,
          values
        );
        return res.json({ success: true, message: `Marks recorded for ${marksData.length} entries` });
      }
    }

    // Single insert
    if (student_id && semester && subject && marks_obtained !== undefined) {
      // Get student's branch_id if not provided
      const [studentData] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [student_id]);
      const studentBranchId = studentData[0]?.branch_id || branchId;

      await pool.execute(
        `INSERT INTO marks (student_id, semester, subject, marks_obtained, max_marks, branch_id, teacher_id, exam_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, semester, subject, marks_obtained, max_marks, studentBranchId, teacherId, exam_type || 'Exam']
      );

      return res.json({ success: true, message: 'Marks recorded successfully' });
    }

    return res.status(400).json({ success: false, message: 'Invalid data. Provide student_id, semester, subject, marks_obtained or marks array' });
  } catch (error) {
    console.error('Insert marks error:', error);
    res.status(500).json({ success: false, message: 'Failed to insert marks', error: error.message });
  }
};

module.exports = {
  getStudentList,
  getAssignments,
  updateAssignment,
  getAttendanceGraph,
  sendMessage,
  getMessages,
  sendNotice,
  getNotices,
  createAssignment,
  insertAttendance,
  insertMarks
};

