const pool = require('../config/database');

// Get Parent's Children List
const getChildrenList = async (req, res) => {
  try {
    const parentId = req.user.userId; // This is parent.id from JWT token

    // Get children directly from parents table (student_id column)
    // Also check if parent email matches student's parent_email
    const [children] = await pool.execute(
      `SELECT DISTINCT s.*, b.code as branch_code, b.name as branch_name, p.name as parent_name, p.email as parent_email
       FROM students s
       JOIN parents p ON s.id = p.student_id
       LEFT JOIN branches b ON s.branch_id = b.id
       WHERE p.id = ?
       ORDER BY s.name ASC`,
      [parentId]
    );

    // Also check if parent email matches student's parent_email (for cases where parent record doesn't exist)
    if (children.length === 0) {
      // Get parent email
      const [parentInfo] = await pool.execute('SELECT email FROM parents WHERE id = ?', [parentId]);
      if (parentInfo.length > 0) {
        const parentEmail = parentInfo[0].email;
        const [childrenByEmail] = await pool.execute(
          `SELECT DISTINCT s.*, b.code as branch_code, b.name as branch_name, 
                  s.parent_email as parent_email, s.father_name as parent_name
           FROM students s
           LEFT JOIN branches b ON s.branch_id = b.id
           WHERE s.parent_email = ?
           ORDER BY s.name ASC`,
          [parentEmail]
        );
        
        if (childrenByEmail.length > 0) {
          const formattedChildren = childrenByEmail.map(s => ({
            id: s.id,
            roll_no: s.roll_no,
            name: s.name,
            section: s.section,
            branch: s.branch_code || s.branch_id,
            branch_name: s.branch_name || '',
            branch_id: s.branch_id,
            year: s.year,
            email: s.email,
            phone: s.phone,
            dob: s.dob,
            father_name: s.father_name,
            mother_name: s.mother_name,
            parent_name: s.parent_name,
            parent_email: s.parent_email
          }));
          return res.json({ success: true, data: formattedChildren });
        }
      }
    }

    // Format children data
    const formattedChildren = children.map(s => ({
      id: s.id,
      roll_no: s.roll_no,
      name: s.name,
      section: s.section,
      branch: s.branch_code || s.branch_id,
      branch_name: s.branch_name || '',
      branch_id: s.branch_id,
      year: s.year,
      email: s.email,
      phone: s.phone,
      dob: s.dob,
      father_name: s.father_name,
      mother_name: s.mother_name,
      parent_name: s.parent_name,
      parent_email: s.parent_email
    }));

    res.json({ success: true, data: formattedChildren });
  } catch (error) {
    console.error('Get children error:', error);
    // Handle table doesn't exist error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch children', error: error.message });
  }
};

// Select Child (for viewing their data)
const selectChild = async (req, res) => {
  try {
    const { student_id } = req.body;
    const parentId = req.user.userId; // This is parent.id from JWT token

    // Verify parent has access to this student (check parents.student_id)
    const [relation] = await pool.execute(
      'SELECT * FROM parents WHERE id = ? AND student_id = ?',
      [parentId, student_id]
    );

    if (relation.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied. Not your child.' });
    }

    res.json({ success: true, message: 'Child selected', student_id });
  } catch (error) {
    console.error('Select child error:', error);
    res.status(500).json({ success: false, message: 'Failed to select child', error: error.message });
  }
};

// Get Child Attendance
const getChildAttendance = async (req, res) => {
  try {
    const { student_id } = req.query;
    const parentId = req.user.userId; // This is parent.id from JWT token

    // Verify access (check parents.student_id)
    const [relation] = await pool.execute(
      'SELECT * FROM parents WHERE id = ? AND student_id = ?',
      [parentId, student_id]
    );

    if (relation.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get attendance data (last 30 days - same as student portal)
    const [attendance] = await pool.execute(
      `SELECT date, status, remarks 
       FROM attendance 
       WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       ORDER BY date DESC
       LIMIT 100`,
      [student_id]
    );

    // Get stats (last 30 days - same as student portal)
    const [stats] = await pool.execute(
      `SELECT 
         COUNT(DISTINCT date) as total_days,
         SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
         SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
         SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
         SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_day_days
       FROM attendance 
       WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [student_id]
    );

    const totalDays = stats[0]?.total_days || 0;
    const presentDays = stats[0]?.present_days || 0;
    const absentDays = stats[0]?.absent_days || 0;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    // Get monthly attendance data for chart
    const [monthlyData] = await pool.execute(
      `SELECT 
         DATE_FORMAT(date, '%Y-%m') as month,
         COUNT(DISTINCT date) as total_days,
         SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days
       FROM attendance 
       WHERE student_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(date, '%Y-%m')
       ORDER BY month ASC`,
      [student_id]
    );

    res.json({
      success: true,
      data: {
        totalDays,
        presentDays,
        absentDays,
        lateDays: stats[0]?.late_days || 0,
        halfDayDays: stats[0]?.half_day_days || 0,
        percentage: parseFloat(percentage),
        attendance: attendance,
        monthlyData: monthlyData.map(m => ({
          month: m.month,
          total_days: m.total_days,
          present_days: m.present_days
        }))
      }
    });
  } catch (error) {
    console.error('Get child attendance error:', error);
    // Handle table doesn't exist error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ 
        success: true, 
        data: {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          percentage: 0,
          attendance: [],
          monthlyData: []
        }
      });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
};

// Get Child Assignments (both assigned by teacher and submitted by student)
const getChildAssignments = async (req, res) => {
  try {
    const { student_id } = req.query;
    const parentId = req.user.userId; // This is parent.id from JWT token

    // Verify access (check parents.student_id)
    const [relation] = await pool.execute(
      'SELECT * FROM parents WHERE id = ? AND student_id = ?',
      [parentId, student_id]
    );

    if (relation.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get student's branch
    const [students] = await pool.execute('SELECT branch_id, year FROM students WHERE id = ?', [student_id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const branchId = students[0].branch_id;

    // Get assignments assigned by teachers (for student's branch) - These are assignments given to all students in branch
    const [teacherAssignments] = await pool.execute(
      `SELECT a.*, t.name as teacher_name, 'assigned' as assignment_type, 0 as is_submitted
       FROM assignments a
       LEFT JOIN teachers t ON a.teacher_id = t.id
       WHERE a.branch_id = ? AND (a.student_id IS NULL OR a.student_id = 0)
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [branchId]
    );

    // Get assignments submitted by this student
    const [submittedAssignments] = await pool.execute(
      `SELECT a.*, t.name as teacher_name, 'submitted' as assignment_type, 1 as is_submitted
       FROM assignments a
       LEFT JOIN teachers t ON a.teacher_id = t.id
       WHERE a.student_id = ?
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [student_id]
    );

    // Combine both types of assignments and remove duplicates
    const assignmentMap = new Map();
    
    // Add submitted assignments first (they take priority)
    submittedAssignments.forEach(a => {
      assignmentMap.set(a.id || a.title, { ...a, is_submitted: true });
    });
    
    // Add teacher assignments if not already present
    teacherAssignments.forEach(a => {
      if (!assignmentMap.has(a.id || a.title)) {
        assignmentMap.set(a.id || a.title, { ...a, is_submitted: false });
      }
    });

    const allAssignments = Array.from(assignmentMap.values());

    res.json({ success: true, data: allAssignments });
  } catch (error) {
    console.error('Get child assignments error:', error);
    // Handle table doesn't exist error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
};

// Get Child Test Marks (from marks table) - Only completed semesters
const getChildMarks = async (req, res) => {
  try {
    const { student_id } = req.query;
    const parentId = req.user.userId; // This is parent.id from JWT token

    // Verify access (check parents.student_id)
    const [relation] = await pool.execute(
      'SELECT * FROM parents WHERE id = ? AND student_id = ?',
      [parentId, student_id]
    );

    if (relation.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get student's current semester
    const [studentInfo] = await pool.execute('SELECT semester FROM students WHERE id = ?', [student_id]);
    // If semester null, show all
    const currentSemester = studentInfo[0]?.semester || 99;

    // Fetch from marks table - include current semester (<=)
    const [marks] = await pool.execute(
      `SELECT m.*, 
       (m.marks_obtained / m.max_marks * 100) as percentage,
       DATE_FORMAT(m.created_at, '%Y-%m-%d') as exam_date
       FROM marks m 
       WHERE m.student_id = ? AND m.semester <= ?
       ORDER BY m.semester ASC, m.created_at DESC`,
      [student_id, currentSemester]
    );

    // Format marks
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
    console.error('Get child marks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch marks', error: error.message });
  }
};

// Get Child Semester Results (from marks table)
// Only show completed semesters (semesters less than current semester)
const getChildSemesterResults = async (req, res) => {
  try {
    const { student_id } = req.query;
    const parentId = req.user.userId; // This is parent.id from JWT token

    // Verify access (check parents.student_id)
    const [relation] = await pool.execute(
      'SELECT * FROM parents WHERE id = ? AND student_id = ?',
      [parentId, student_id]
    );

    if (relation.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get student's current semester
    const [studentInfo] = await pool.execute('SELECT semester FROM students WHERE id = ?', [student_id]);
    const currentSemester = studentInfo[0]?.semester || 1;

    // Get marks grouped by semester - include current semester (<=)
    const [results] = await pool.execute(
      `SELECT 
       semester,
       COUNT(*) as total_subjects,
       AVG((marks_obtained / max_marks) * 100) as percentage,
       SUM(marks_obtained) as total_obtained,
       SUM(max_marks) as total_max
       FROM marks 
       WHERE student_id = ? AND semester <= ?
       GROUP BY semester
       ORDER BY semester ASC`,
      [student_id, currentSemester]
    );

    // Format results - only return semesters that have actual marks
    const formatSemester = (sem) => {
      if (sem === 1) return '1st';
      if (sem === 2) return '2nd';
      if (sem === 3) return '3rd';
      if (sem === 4) return '4th';
      if (sem === 5) return '5th';
      if (sem === 6) return '6th';
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const v = sem % 100;
      return `${sem}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
    };

    const formattedResults = results.map(r => ({
      semester: r.semester,
      semester_label: formatSemester(r.semester),
      percentage: parseFloat(r.percentage || 0).toFixed(2),
      status: parseFloat(r.percentage || 0) >= 40 ? 'pass' : 'fail',
      total_subjects: r.total_subjects,
      total_obtained: parseFloat(r.total_obtained || 0),
      total_max: parseFloat(r.total_max || 0)
    }));

    res.json({ success: true, data: formattedResults });
  } catch (error) {
    console.error('Get child results error:', error);
    // Handle table doesn't exist error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
  }
};

// Send Message to Teacher
const sendMessageToTeacher = async (req, res) => {
  try {
    const { teacher_id, subject, message, student_id } = req.body;
    const parentId = req.user.userId;

    if (!teacher_id || !message) {
      return res.status(400).json({ success: false, message: 'teacher_id and message are required' });
    }

    // Get teacher user_id
    const [teachers] = await pool.execute('SELECT user_id FROM teachers WHERE id = ?', [teacher_id]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    await pool.execute(
      `INSERT INTO messages (from_id, from_role, to_id, to_role, subject, message) 
       VALUES (?, 'parent', ?, 'teacher', ?, ?)`,
      [parentId, teachers[0].user_id, subject || '', message]
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
    const parentId = req.user.userId;

    const [messages] = await pool.execute(
      `SELECT m.*, u.email as from_email 
       FROM messages m
       JOIN users u ON m.from_id = u.id
       WHERE m.to_id = ?
       ORDER BY m.created_at DESC`,
      [parentId]
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// Get Notices
const getNotices = async (req, res) => {
  try {
    const parentId = req.user.userId; // This is parent.id from JWT token
    
    // Get parent's children's branches
    const [parent] = await pool.execute('SELECT id, student_id FROM parents WHERE id = ?', [parentId]);
    if (parent.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    // Get all children's branch_ids
    const [children] = await pool.execute(
      `SELECT DISTINCT s.branch_id 
       FROM students s 
       JOIN parents p ON s.id = p.student_id 
       WHERE p.id = ?`,
      [parentId]
    );
    
    const branchIds = children.map(c => c.branch_id).filter(Boolean);

    // If no branch found, return empty array
    if (branchIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const placeholders = branchIds.map(() => '?').join(',');

    const [notices] = await pool.execute(
      `SELECT n.*, 
       CASE 
         WHEN n.sender_type = 'admin' THEN a.name
         WHEN n.sender_type = 'teacher' THEN t.name
         ELSE 'System'
       END as sender_name
       FROM notices n
       LEFT JOIN admins a ON n.sender_id = a.id AND n.sender_type = 'admin'
       LEFT JOIN teachers t ON n.sender_id = t.id AND n.sender_type = 'teacher'
       WHERE (n.recipient_type = 'all' 
              OR n.recipient_type = 'parent'
              OR (n.recipient_type = 'branch' AND n.branch_id IN (${placeholders})))
       ORDER BY n.created_at DESC`,
      branchIds
    );

    res.json({ success: true, data: notices });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notices', error: error.message });
  }
};

module.exports = {
  getChildrenList,
  selectChild,
  getChildAttendance,
  getChildAssignments,
  getChildMarks,
  getChildSemesterResults,
  sendMessageToTeacher,
  getMessages,
  getNotices
};

