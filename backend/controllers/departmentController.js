const pool = require('../config/database');

// Get all departments
const getAllDepartments = async (req, res) => {
  try {
    const [departments] = await pool.query(
      'SELECT * FROM departments ORDER BY name'
    );
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Error fetching departments', error: error.message });
  }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [departments] = await pool.query(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );
    
    if (departments.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    
    res.json({ success: true, data: departments[0] });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ success: false, message: 'Error fetching department', error: error.message });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById
};

