const pool = require('../config/database');

// Get all NSS students
const getNSSStudents = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT * FROM nss_students 
       WHERE status = 'active' 
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching NSS students:', error);
    res.status(500).json({ success: false, message: 'Error fetching NSS students', error: error.message });
  }
};

// Get all NCC students
const getNCCStudents = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT * FROM ncc_students 
       WHERE status = 'active' 
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching NCC students:', error);
    res.status(500).json({ success: false, message: 'Error fetching NCC students', error: error.message });
  }
};

// Add NSS student
const addNSSStudent = async (req, res) => {
  try {
    const { registration_id, name, location, father_name, mother_name, program, category, dob, gender, email, phone } = req.body;
    
    if (!registration_id || !name || !location || !father_name || !mother_name || !program || !category || !dob || !gender) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const [result] = await pool.query(
      `INSERT INTO nss_students 
       (registration_id, name, location, father_name, mother_name, program, category, dob, gender, email, phone, teacher_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Sonu Kumar')`,
      [registration_id, name, location, father_name, mother_name, program, category, dob, gender, email || null, phone || null]
    );

    res.json({ success: true, message: 'NSS student added successfully', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Registration ID already exists' });
    }
    console.error('Error adding NSS student:', error);
    res.status(500).json({ success: false, message: 'Error adding NSS student', error: error.message });
  }
};

// Add NCC student
const addNCCStudent = async (req, res) => {
  try {
    const { registration_id, name, location, father_name, mother_name, program, category, dob, gender, email, phone } = req.body;
    
    if (!registration_id || !name || !location || !father_name || !mother_name || !program || !category || !dob || !gender) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const [result] = await pool.query(
      `INSERT INTO ncc_students 
       (registration_id, name, location, father_name, mother_name, program, category, dob, gender, email, phone, teacher_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Vivek Morya')`,
      [registration_id, name, location, father_name, mother_name, program, category, dob, gender, email || null, phone || null]
    );

    res.json({ success: true, message: 'NCC student added successfully', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Registration ID already exists' });
    }
    console.error('Error adding NCC student:', error);
    res.status(500).json({ success: false, message: 'Error adding NCC student', error: error.message });
  }
};

// Update NSS student
const updateNSSStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { registration_id, name, location, father_name, mother_name, program, category, dob, gender, email, phone, status } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (registration_id) { updateFields.push('registration_id = ?'); updateValues.push(registration_id); }
    if (name) { updateFields.push('name = ?'); updateValues.push(name); }
    if (location) { updateFields.push('location = ?'); updateValues.push(location); }
    if (father_name) { updateFields.push('father_name = ?'); updateValues.push(father_name); }
    if (mother_name) { updateFields.push('mother_name = ?'); updateValues.push(mother_name); }
    if (program) { updateFields.push('program = ?'); updateValues.push(program); }
    if (category) { updateFields.push('category = ?'); updateValues.push(category); }
    if (dob) { updateFields.push('dob = ?'); updateValues.push(dob); }
    if (gender) { updateFields.push('gender = ?'); updateValues.push(gender); }
    if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
    if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(phone); }
    if (status) { updateFields.push('status = ?'); updateValues.push(status); }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updateValues.push(id);

    await pool.query(
      `UPDATE nss_students SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ success: true, message: 'NSS student updated successfully' });
  } catch (error) {
    console.error('Error updating NSS student:', error);
    res.status(500).json({ success: false, message: 'Error updating NSS student', error: error.message });
  }
};

// Update NCC student
const updateNCCStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { registration_id, name, location, father_name, mother_name, program, category, dob, gender, email, phone, status } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (registration_id) { updateFields.push('registration_id = ?'); updateValues.push(registration_id); }
    if (name) { updateFields.push('name = ?'); updateValues.push(name); }
    if (location) { updateFields.push('location = ?'); updateValues.push(location); }
    if (father_name) { updateFields.push('father_name = ?'); updateValues.push(father_name); }
    if (mother_name) { updateFields.push('mother_name = ?'); updateValues.push(mother_name); }
    if (program) { updateFields.push('program = ?'); updateValues.push(program); }
    if (category) { updateFields.push('category = ?'); updateValues.push(category); }
    if (dob) { updateFields.push('dob = ?'); updateValues.push(dob); }
    if (gender) { updateFields.push('gender = ?'); updateValues.push(gender); }
    if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
    if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(phone); }
    if (status) { updateFields.push('status = ?'); updateValues.push(status); }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updateValues.push(id);

    await pool.query(
      `UPDATE ncc_students SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ success: true, message: 'NCC student updated successfully' });
  } catch (error) {
    console.error('Error updating NCC student:', error);
    res.status(500).json({ success: false, message: 'Error updating NCC student', error: error.message });
  }
};

// Delete NSS student (soft delete - set status to inactive)
const deleteNSSStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE nss_students SET status = ? WHERE id = ?', ['inactive', id]);
    res.json({ success: true, message: 'NSS student deleted successfully' });
  } catch (error) {
    console.error('Error deleting NSS student:', error);
    res.status(500).json({ success: false, message: 'Error deleting NSS student', error: error.message });
  }
};

// Delete NCC student (soft delete - set status to inactive)
const deleteNCCStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE ncc_students SET status = ? WHERE id = ?', ['inactive', id]);
    res.json({ success: true, message: 'NCC student deleted successfully' });
  } catch (error) {
    console.error('Error deleting NCC student:', error);
    res.status(500).json({ success: false, message: 'Error deleting NCC student', error: error.message });
  }
};

module.exports = {
  getNSSStudents,
  getNCCStudents,
  addNSSStudent,
  addNCCStudent,
  updateNSSStudent,
  updateNCCStudent,
  deleteNSSStudent,
  deleteNCCStudent
};

