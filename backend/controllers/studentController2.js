const pool = require('../config/database');

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT s.*, d.name as department_name, d.code as department_code 
       FROM students s 
       LEFT JOIN departments d ON s.department_id = d.id 
       WHERE s.status = 'active'
       ORDER BY s.roll_no`
    );
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Error fetching students', error: error.message });
  }
};

// Get student by roll number
const getStudentByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const [students] = await pool.query(
      `SELECT s.*, d.name as department_name, d.code as department_code 
       FROM students s 
       LEFT JOIN departments d ON s.department_id = d.id 
       WHERE s.roll_no = ?`,
      [rollNo]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.json({ success: true, data: students[0] });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ success: false, message: 'Error fetching student', error: error.message });
  }
};

// Get students by department
const getStudentsByDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const [students] = await pool.query(
      `SELECT s.*, d.name as department_name, d.code as department_code 
       FROM students s 
       LEFT JOIN departments d ON s.department_id = d.id 
       WHERE s.department_id = ? AND s.status = 'active'
       ORDER BY s.roll_no`,
      [id]
    );
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students by department:', error);
    res.status(500).json({ success: false, message: 'Error fetching students', error: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentByRollNo,
  getStudentsByDepartment
};

