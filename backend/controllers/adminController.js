const pool = require('../config/database');

// Get all teachers
const getTeachers = async (req, res) => {
  try {
    const [teachers] = await pool.execute(
      `SELECT t.*, b.name as branch_name, b.code as branch_code
       FROM teachers t 
       LEFT JOIN branches b ON t.branch_id = b.id
       ORDER BY t.id DESC`
    );
    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
  }
};

// Get all students
const getStudents = async (req, res) => {
  try {
    const { branch, year, search } = req.query;
    
    // Base query - select specific columns to avoid conflicts
    let query = `
      SELECT 
        s.id, s.roll_no, s.name, s.email, s.phone, s.branch_id, 
        s.year, s.section, s.semester, s.father_name, s.mother_name, 
        s.dob, s.parent_email, s.parent_phone, s.blood_group, s.status, s.created_at,
        COALESCE(b.name, 'Unknown') as branch_name, 
        COALESCE(b.code, 'N/A') as branch_code,
        COALESCE(p.email, '') as parent_email_from_table,
        COALESCE(p.phone, '') as parent_phone_from_table,
        COALESCE(p.name, '') as parent_name_from_table
      FROM students s
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN parents p ON s.id = p.student_id
      WHERE 1=1
    `;
    let params = [];

    if (branch) {
      // Check if branch is code or ID
      if (isNaN(branch)) {
        query += ' AND b.code = ?';
      } else {
        query += ' AND s.branch_id = ?';
      }
      params.push(branch);
    }
    if (year) {
      query += ' AND s.year = ?';
      params.push(year);
    }
    if (search) {
      query += ' AND (s.name LIKE ? OR s.roll_no LIKE ? OR s.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY s.roll_no ASC';

    const [students] = await pool.execute(query, params);
    
    console.log(`✅ Fetched ${students.length} students for admin`);
    
    // Format students data
    const formattedStudents = students.map(s => ({
      id: s.id,
      roll_no: s.roll_no || '-',
      name: s.name || '-',
      email: s.email || '-',
      phone: s.phone || '-',
      branch: s.branch_code || s.branch_name || '-',
      branch_name: s.branch_name || '-',
      branch_code: s.branch_code || '-',
      branch_id: s.branch_id,
      year: s.year || '-',
      section: s.section || '-',
      semester: s.semester || '-',
      father_name: s.father_name || '-',
      mother_name: s.mother_name || '-',
      dob: s.dob ? new Date(s.dob).toLocaleDateString() : '-',
      parent_email: s.parent_email_from_table || s.parent_email || '-',
      parent_phone: s.parent_phone_from_table || s.parent_phone || '-',
      parent_name: s.parent_name_from_table || '-',
      blood_group: s.blood_group || '-',
      status: s.status || 'active',
      created_at: s.created_at
    }));
    
    res.json({ success: true, data: formattedStudents });
  } catch (error) {
    console.error('❌ Get students error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

// Get all parents
const getParents = async (req, res) => {
  try {
    const [parents] = await pool.execute(
      `SELECT 
        p.id, p.email, p.name, p.phone, p.student_id, p.created_at, p.updated_at,
        COALESCE(s.roll_no, 'N/A') as roll_no, 
        COALESCE(s.name, 'N/A') as student_name, 
        COALESCE(s.year, 'N/A') as year,
        COALESCE(b.name, 'N/A') as branch_name, 
        COALESCE(b.code, 'N/A') as branch_code
       FROM parents p
       LEFT JOIN students s ON p.student_id = s.id
       LEFT JOIN branches b ON s.branch_id = b.id
       ORDER BY p.id DESC`
    );
    
    console.log(`✅ Fetched ${parents.length} parents for admin`);
    
    // Format parents data
    const formattedParents = parents.map(p => ({
      id: p.id,
      name: p.name || '-',
      email: p.email || '-',
      phone: p.phone || '-',
      student_id: p.student_id || null,
      student_name: p.student_name || '-',
      roll_no: p.roll_no || '-',
      branch: p.branch_code !== 'N/A' ? p.branch_code : (p.branch_name !== 'N/A' ? p.branch_name : '-'),
      branch_name: p.branch_name !== 'N/A' ? p.branch_name : '-',
      branch_code: p.branch_code !== 'N/A' ? p.branch_code : '-',
      year: p.year !== 'N/A' ? p.year : '-',
      created_at: p.created_at,
      updated_at: p.updated_at
    }));
    
    res.json({ success: true, data: formattedParents });
  } catch (error) {
    console.error('❌ Get parents error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch parents', error: error.message });
  }
};

// Get statistics
const getStatistics = async (req, res) => {
  try {
    // Run each count separately so a missing optional table (like notices) doesn't break everything
    const [teacherCountRows] = await pool.execute('SELECT COUNT(*) as count FROM teachers');
    const [studentCountRows] = await pool.execute('SELECT COUNT(*) as count FROM students');
    const [parentCountRows] = await pool.execute('SELECT COUNT(*) as count FROM parents');

    let noticesCount = 0;
    try {
      const [noticeCountRows] = await pool.execute('SELECT COUNT(*) as count FROM notices');
      noticesCount = noticeCountRows[0].count;
    } catch (err) {
      // If notices table doesn't exist in smart_campus, just treat as 0 instead of 500 error
      if (err.code !== 'ER_NO_SUCH_TABLE' && err.code !== 'ER_BAD_DB_ERROR') {
        throw err;
      }
      console.warn('Notices table not found, statistics will show 0 notices.');
      noticesCount = 0;
    }

    res.json({
      success: true,
      data: {
        teachers: teacherCountRows[0].count,
        students: studentCountRows[0].count,
        parents: parentCountRows[0].count,
        notices: noticesCount
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

// Send notice to users
const sendNotice = async (req, res) => {
  try {
    const { title, message, recipient_type, recipient_ids, branch_id, priority = 'medium' } = req.body;
    const adminId = req.user.userId;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    // Insert notice with priority
    const [result] = await pool.execute(
      `INSERT INTO notices (title, message, sender_type, sender_id, recipient_type, branch_id, priority, created_at) 
       VALUES (?, ?, 'admin', ?, ?, ?, ?, NOW())`,
      [title, message, adminId, recipient_type || 'all', branch_id || null, priority]
    );

    const noticeId = result.insertId;

    res.json({ success: true, message: 'Notice sent successfully', data: { noticeId } });
  } catch (error) {
    console.error('Send notice error:', error);
    res.status(500).json({ success: false, message: 'Failed to send notice', error: error.message });
  }
};

// Get all notices
const getNotices = async (req, res) => {
  try {
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
       ORDER BY n.created_at DESC`
    );
    res.json({ success: true, data: notices });
  } catch (error) {
    console.error('Get notices error:', error);
    // If notices table doesn't exist in current DB, just return empty array instead of 500
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch notices', error: error.message });
  }
};

// Delete user (teacher/student/parent)
const deleteUser = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!['teacher', 'student', 'parent'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    let table = type === 'teacher' ? 'teachers' : type === 'student' ? 'students' : 'parents';
    await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);

    res.json({ success: true, message: `${type} deleted successfully` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

// Get branches
const getBranches = async (req, res) => {
  try {
    const [branches] = await pool.execute('SELECT * FROM branches ORDER BY name ASC');
    // Format branches to handle both name and branch_name columns
    const formattedBranches = branches.map(b => ({
      ...b,
      name: b.name || b.branch_name || 'Unknown',
      branch_name: b.branch_name || b.name || 'Unknown'
    }));
    res.json({ success: true, data: formattedBranches });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch branches', error: error.message });
  }
};

module.exports = {
  getTeachers,
  getStudents,
  getParents,
  getStatistics,
  sendNotice,
  getNotices,
  deleteUser,
  getBranches
};

