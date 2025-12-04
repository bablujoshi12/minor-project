const pool = require('../config/database');

// Get all faculty
const getAllFaculty = async (req, res) => {
  try {
    const [faculty] = await pool.query(
      `SELECT f.*, d.name as department_name, d.code as department_code 
       FROM faculty f 
       LEFT JOIN departments d ON f.department_id = d.id 
       WHERE f.status = 'active'
       ORDER BY f.name`
    );
    res.json({ success: true, data: faculty || [] });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    // Return empty array if table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Error fetching faculty', error: error.message });
  }
};

// Get faculty by department
const getFacultyByDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const [faculty] = await pool.query(
      `SELECT f.*, d.name as department_name, d.code as department_code 
       FROM faculty f 
       LEFT JOIN departments d ON f.department_id = d.id 
       WHERE f.department_id = ? AND f.status = 'active'
       ORDER BY f.name`,
      [id]
    );
    res.json({ success: true, data: faculty || [] });
  } catch (error) {
    console.error('Error fetching faculty by department:', error);
    // Return empty array if table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Error fetching faculty', error: error.message });
  }
};

module.exports = {
  getAllFaculty,
  getFacultyByDepartment
};

