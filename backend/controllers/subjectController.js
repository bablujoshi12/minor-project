const pool = require('../config/database');

// Get All Subjects
const getAllSubjects = async (req, res) => {
  try {
    const { semester, branch_id, branch_code } = req.query;
    
    let query = `
      SELECT s.*, b.code as branch_code, b.name as branch_name 
      FROM subjects s
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE s.status = 'active'
    `;
    const params = [];
    
    if (semester) {
      query += ' AND s.semester = ?';
      params.push(semester);
    }
    
    if (branch_id) {
      query += ' AND (s.branch_id = ? OR s.branch_id IS NULL)';
      params.push(branch_id);
    }
    
    if (branch_code) {
      query += ' AND (b.code = ? OR s.branch_id IS NULL)';
      params.push(branch_code);
    }
    
    query += ' ORDER BY s.semester ASC, s.subject_name ASC';
    
    const [subjects] = await pool.execute(query, params);
    
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    // If table doesn't exist, return empty array
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch subjects', error: error.message });
  }
};

// Get Subjects by Semester
const getSubjectsBySemester = async (req, res) => {
  try {
    const { semester } = req.params;
    const { branch_id, branch_code } = req.query;
    
    let query = `
      SELECT s.*, b.code as branch_code, b.name as branch_name 
      FROM subjects s
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE s.semester = ? AND s.status = 'active'
    `;
    const params = [semester];
    
    if (branch_id) {
      query += ' AND (s.branch_id = ? OR s.branch_id IS NULL)';
      params.push(branch_id);
    }
    
    if (branch_code) {
      query += ' AND (b.code = ? OR s.branch_id IS NULL)';
      params.push(branch_code);
    }
    
    query += ' ORDER BY s.subject_name ASC';
    
    const [subjects] = await pool.execute(query, params);
    
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Get subjects by semester error:', error);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch subjects', error: error.message });
  }
};

// Get Subject by ID
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [subjects] = await pool.execute(
      `SELECT s.*, b.code as branch_code, b.name as branch_name 
       FROM subjects s
       LEFT JOIN branches b ON s.branch_id = b.id
       WHERE s.id = ?`,
      [id]
    );
    
    if (subjects.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    res.json({ success: true, data: subjects[0] });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subject', error: error.message });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectsBySemester,
  getSubjectById
};

