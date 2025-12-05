const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// ========== STUDENT MANAGEMENT ==========

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [students] = await pool.execute(
      `SELECT 
        s.*, 
        b.name as branch_name, b.code as branch_code,
        d.name as department_name, d.code as department_code,
        p.id as parent_id, p.name as parent_name, p.email as parent_email, p.phone as parent_phone
      FROM students s
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN parents p ON s.id = p.student_id
      WHERE s.id = ?`,
      [id]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.json({ success: true, data: students[0] });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student', error: error.message });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const {
      roll_no, name, email, password, phone, branch_id, department_id,
      year, semester, section, father_name, mother_name, dob, sex,
      category, parent_email, parent_phone, parent_name, blood_group, status = 'active'
    } = req.body;

    // Validation
    if (!roll_no || !name) {
      return res.status(400).json({ success: false, message: 'Roll number and name are required' });
    }

    // Check if roll_no already exists
    const [existing] = await pool.execute('SELECT id FROM students WHERE roll_no = ?', [roll_no]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Student with this roll number already exists' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const [emailCheck] = await pool.execute('SELECT id FROM students WHERE email = ?', [email]);
      if (emailCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Student with this email already exists' });
      }
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Convert year if it's academic year (1, 2, 3) to calendar year
    let finalYear = year;
    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        // Mapping: Year 1 → 2025, Year 2 → 2024, Year 3 → 2023
        if (yearNum === 1) {
          finalYear = 2025;
        } else if (yearNum === 2) {
          finalYear = 2024;
        } else if (yearNum === 3) {
          finalYear = 2023;
        } else if (yearNum >= 1901 && yearNum <= 2155) {
          // Already a valid calendar year, use as-is
          finalYear = yearNum;
        } else {
          finalYear = null;
        }
      }
    }

    // Insert student
    const [result] = await pool.execute(
      `INSERT INTO students (
        roll_no, name, email, password, phone, branch_id, department_id,
        year, semester, section, father_name, mother_name, dob, sex,
        category, parent_email, parent_phone, blood_group, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roll_no, name, email || null, hashedPassword, phone || null, branch_id || null, department_id || null,
        finalYear || null, semester || null, section || null, father_name || null, mother_name || null,
        dob || null, sex || null, category || null, parent_email || null, parent_phone || null,
        blood_group || null, status
      ]
    );

    const studentId = result.insertId;

    // Create parent record if parent info provided
    if (parent_email || parent_name || parent_phone) {
      try {
        await pool.execute(
          `INSERT INTO parents (student_id, email, name, phone) VALUES (?, ?, ?, ?)`,
          [studentId, parent_email || null, parent_name || null, parent_phone || null]
        );
      } catch (err) {
        console.warn('Failed to create parent record:', err.message);
      }
    }

    res.json({ success: true, message: 'Student created successfully', data: { id: studentId } });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'Failed to create student', error: error.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      roll_no, name, email, password, phone, branch_id, department_id,
      year, semester, section, father_name, mother_name, dob, sex,
      category, parent_email, parent_phone, parent_name, blood_group, status
    } = req.body;

    // Check if student exists and get current department_id
    const [existing] = await pool.execute('SELECT id, department_id FROM students WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const currentDepartmentId = existing[0].department_id;

    // Check if roll_no is being changed and already exists
    if (roll_no) {
      const [rollCheck] = await pool.execute('SELECT id FROM students WHERE roll_no = ? AND id != ?', [roll_no, id]);
      if (rollCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Roll number already exists' });
      }
    }

    // Check if email is being changed and already exists
    if (email) {
      const [emailCheck] = await pool.execute('SELECT id FROM students WHERE email = ? AND id != ?', [email, id]);
      if (emailCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    // Helper function to convert empty strings to null for integer fields
    const toIntOrNull = (val) => {
      if (val === undefined || val === null || val === '') return null;
      const num = parseInt(val, 10);
      return isNaN(num) ? null : num;
    };

    if (roll_no !== undefined && roll_no !== null && roll_no !== '') { updates.push('roll_no = ?'); values.push(roll_no); }
    if (name !== undefined && name !== null && name !== '') { updates.push('name = ?'); values.push(name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email === '' || email === null ? null : email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone === '' || phone === null ? null : phone); }
    if (branch_id !== undefined) { 
      const branchVal = toIntOrNull(branch_id);
      if (branchVal !== null) {
        updates.push('branch_id = ?'); 
        values.push(branchVal);
      }
    }
    if (department_id !== undefined) { 
      const deptVal = toIntOrNull(department_id);
      // department_id is NOT NULL in database, so only update if we have a valid value
      // If null/empty, keep the existing department_id (don't update it)
      if (deptVal !== null) {
        updates.push('department_id = ?'); 
        values.push(deptVal);
      }
      // If deptVal is null and no existing department_id, we can't proceed
      else if (!currentDepartmentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Department ID is required. Please select a department.' 
        });
      }
    }
    if (year !== undefined) { 
      const yearVal = toIntOrNull(year);
      if (yearVal !== null) {
        let finalYear = yearVal;
        
        // If year is 1-3 (academic year), convert to calendar year
        // Mapping: Year 1 → 2025, Year 2 → 2024, Year 3 → 2023
        if (yearVal === 1) {
          finalYear = 2025;
        } else if (yearVal === 2) {
          finalYear = 2024;
        } else if (yearVal === 3) {
          finalYear = 2023;
        }
        
        // Validate it's a valid YEAR range for MySQL (1901-2155)
        if (finalYear >= 1901 && finalYear <= 2155) {
          updates.push('year = ?'); 
          values.push(finalYear);
        } else {
          console.warn(`Invalid year value: ${yearVal} (converted to ${finalYear}), skipping update`);
        }
      }
    }
    if (semester !== undefined) { 
      const semVal = toIntOrNull(semester);
      if (semVal !== null) {
        updates.push('semester = ?'); 
        values.push(semVal);
      }
    }
    if (section !== undefined) { updates.push('section = ?'); values.push(section === '' || section === null ? null : section); }
    if (father_name !== undefined) { updates.push('father_name = ?'); values.push(father_name === '' || father_name === null ? null : father_name); }
    if (mother_name !== undefined) { updates.push('mother_name = ?'); values.push(mother_name === '' || mother_name === null ? null : mother_name); }
    if (dob !== undefined) { updates.push('dob = ?'); values.push(dob === '' || dob === null ? null : dob); }
    if (sex !== undefined) { updates.push('sex = ?'); values.push(sex === '' || sex === null ? null : sex); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category === '' || category === null ? null : category); }
    if (parent_email !== undefined) { updates.push('parent_email = ?'); values.push(parent_email === '' || parent_email === null ? null : parent_email); }
    if (parent_phone !== undefined) { updates.push('parent_phone = ?'); values.push(parent_phone === '' || parent_phone === null ? null : parent_phone); }
    if (blood_group !== undefined) { updates.push('blood_group = ?'); values.push(blood_group === '' || blood_group === null ? null : blood_group); }
    if (status !== undefined && status !== null) { updates.push('status = ?'); values.push(status); }

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    
    try {
      await pool.execute(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`, values);
    } catch (dbError) {
      console.error('Database update error:', dbError);
      console.error('Update query:', `UPDATE students SET ${updates.join(', ')} WHERE id = ?`);
      console.error('Values:', values);
      throw dbError;
    }

    // Update parent record if parent info provided
    if (parent_email !== undefined || parent_name !== undefined || parent_phone !== undefined) {
      try {
        const [parentCheck] = await pool.execute('SELECT id FROM parents WHERE student_id = ?', [id]);
        if (parentCheck.length > 0) {
          const parentUpdates = [];
          const parentValues = [];
          if (parent_email !== undefined) { parentUpdates.push('email = ?'); parentValues.push(parent_email === '' || parent_email === null ? null : parent_email); }
          if (parent_name !== undefined) { parentUpdates.push('name = ?'); parentValues.push(parent_name === '' || parent_name === null ? null : parent_name); }
          if (parent_phone !== undefined) { parentUpdates.push('phone = ?'); parentValues.push(parent_phone === '' || parent_phone === null ? null : parent_phone); }
          if (parentUpdates.length > 0) {
            parentValues.push(id);
            await pool.execute(`UPDATE parents SET ${parentUpdates.join(', ')} WHERE student_id = ?`, parentValues);
          }
        } else {
          // Create parent if doesn't exist and at least one field has a value
          if (parent_email || parent_name || parent_phone) {
            await pool.execute(
              `INSERT INTO parents (student_id, email, name, phone) VALUES (?, ?, ?, ?)`,
              [id, parent_email && parent_email !== '' ? parent_email : null, parent_name && parent_name !== '' ? parent_name : null, parent_phone && parent_phone !== '' ? parent_phone : null]
            );
          }
        }
      } catch (parentError) {
        console.error('Error updating parent record:', parentError);
        // Don't fail the whole update if parent update fails
      }
    }

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Failed to update student', error: error.message });
  }
};

// ========== TEACHER MANAGEMENT ==========

// Get teacher by ID
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const [teachers] = await pool.execute(
      `SELECT t.*, b.name as branch_name, b.code as branch_code,
       d.name as department_name, d.code as department_code
      FROM teachers t
      LEFT JOIN branches b ON t.branch_id = b.id
      LEFT JOIN departments d ON b.id = d.id
      WHERE t.id = ?`,
      [id]
    );
    
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    
    res.json({ success: true, data: teachers[0] });
  } catch (error) {
    console.error('Get teacher by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher', error: error.message });
  }
};

// Create new teacher
const createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, branch_id } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Check if email already exists
    const [existing] = await pool.execute('SELECT id FROM teachers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Teacher with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert teacher (teachers table doesn't have status column - removed)
    const [result] = await pool.execute(
      `INSERT INTO teachers (name, email, password, phone, branch_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone || null, branch_id || null]
    );

    res.json({ success: true, message: 'Teacher created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to create teacher', error: error.message });
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, branch_id } = req.body;

    // Check if teacher exists
    const [existing] = await pool.execute('SELECT id FROM teachers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Check if email is being changed and already exists
    if (email) {
      const [emailCheck] = await pool.execute('SELECT id FROM teachers WHERE email = ? AND id != ?', [email, id]);
      if (emailCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    // Build update query (teachers table doesn't have status column - removed)
    const updates = [];
    const values = [];

    if (name !== undefined && name !== null && name !== '') { updates.push('name = ?'); values.push(name); }
    if (email !== undefined && email !== null && email !== '') { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone === '' || phone === null ? null : phone); }
    if (branch_id !== undefined) {
      const branchVal = branch_id === '' || branch_id === null ? null : parseInt(branch_id);
      if (branchVal !== null && !isNaN(branchVal)) {
        updates.push('branch_id = ?');
        values.push(branchVal);
      }
    }

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await pool.execute(`UPDATE teachers SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ success: false, message: 'Failed to update teacher', error: error.message });
  }
};

// ========== DEPARTMENT/BRANCH MANAGEMENT ==========

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [departments] = await pool.execute(
      `SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.hod_name,
        d.total_students,
        d.total_faculty,
        COALESCE((SELECT COUNT(*) FROM students WHERE department_id = d.id), 0) as actual_student_count
      FROM departments d
      WHERE d.id = ?`,
      [id]
    );
    
    if (departments.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    
    const dept = departments[0];
    const formattedDept = {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      description: dept.description || null,
      hod_name: dept.hod_name || null,
      total_students: dept.actual_student_count || dept.total_students || 0,
      total_faculty: dept.total_faculty || 0
    };
    
    res.json({ success: true, data: formattedDept });
  } catch (error) {
    console.error('Get department by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch department', error: error.message });
  }
};

// Create department
const createDepartment = async (req, res) => {
  try {
    const { name, code, description, hod_name } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }

    // Check if code already exists
    const [existing] = await pool.execute('SELECT id FROM departments WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Department with this code already exists' });
    }

    const [result] = await pool.execute(
      `INSERT INTO departments (name, code, description, hod_name) VALUES (?, ?, ?, ?)`,
      [name, code, description || null, hod_name || null]
    );

    res.json({ success: true, message: 'Department created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ success: false, message: 'Failed to create department', error: error.message });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, hod_name } = req.body;

    const [existing] = await pool.execute('SELECT id FROM departments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if code is being changed and already exists
    if (code) {
      const [codeCheck] = await pool.execute('SELECT id FROM departments WHERE code = ? AND id != ?', [code, id]);
      if (codeCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Department code already exists' });
      }
    }

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (code !== undefined) { updates.push('code = ?'); values.push(code); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (hod_name !== undefined) { updates.push('hod_name = ?'); values.push(hod_name); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await pool.execute(`UPDATE departments SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ success: false, message: 'Failed to update department', error: error.message });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department has students
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM students WHERE department_id = ?', [id]);

    if (students[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete department. It has ${students[0].count} associated student(s). Please reassign them first.` 
      });
    }

    await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete department', error: error.message });
  }
};

// Create branch
const createBranch = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }

    // Check if code already exists
    const [existing] = await pool.execute('SELECT id FROM branches WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Branch with this code already exists' });
    }

    const [result] = await pool.execute(
      `INSERT INTO branches (name, code, description) VALUES (?, ?, ?)`,
      [name, code, description || null]
    );

    res.json({ success: true, message: 'Branch created successfully', data: { id: result.insertId } });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ success: false, message: 'Failed to create branch', error: error.message });
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const [existing] = await pool.execute('SELECT id FROM branches WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    // Check if code is being changed and already exists
    if (code) {
      const [codeCheck] = await pool.execute('SELECT id FROM branches WHERE code = ? AND id != ?', [code, id]);
      if (codeCheck.length > 0) {
        return res.status(400).json({ success: false, message: 'Branch code already exists' });
      }
    }

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (code !== undefined) { updates.push('code = ?'); values.push(code); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await pool.execute(`UPDATE branches SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Branch updated successfully' });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ success: false, message: 'Failed to update branch', error: error.message });
  }
};

// Delete branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if branch has students or teachers
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM students WHERE branch_id = ?', [id]);
    const [teachers] = await pool.execute('SELECT COUNT(*) as count FROM teachers WHERE branch_id = ?', [id]);

    if (students[0].count > 0 || teachers[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete branch. It has associated students or teachers. Please reassign them first.' 
      });
    }

    await pool.execute('DELETE FROM branches WHERE id = ?', [id]);
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete branch', error: error.message });
  }
};

// ========== HOD MANAGEMENT ==========

// Get all HODs
const getHODs = async (req, res) => {
  try {
    // First get all departments with HOD names
    const [departments] = await pool.execute(
      `SELECT id as department_id, name as department_name, code as department_code, hod_name
      FROM departments
      WHERE hod_name IS NOT NULL AND hod_name != '' AND hod_name IS NOT NULL
      ORDER BY name ASC`
    );
    
    // Try to match with teachers (optional, don't fail if teachers table has issues)
    const hods = await Promise.all(departments.map(async (dept) => {
      try {
        const [teachers] = await pool.execute(
          `SELECT id, name, email FROM teachers WHERE name = ? COLLATE utf8mb4_unicode_ci LIMIT 1`,
          [dept.hod_name]
        );
        
        if (teachers.length > 0) {
          return {
            department_id: dept.department_id,
            department_name: dept.department_name,
            department_code: dept.department_code,
            hod_name: dept.hod_name,
            teacher_id: teachers[0].id,
            teacher_name: teachers[0].name,
            teacher_email: teachers[0].email
          };
        } else {
          return {
            department_id: dept.department_id,
            department_name: dept.department_name,
            department_code: dept.department_code,
            hod_name: dept.hod_name,
            teacher_id: null,
            teacher_name: null,
            teacher_email: null
          };
        }
      } catch (err) {
        // If teacher lookup fails, just return department info
        console.warn(`Could not match HOD ${dept.hod_name} with teacher:`, err.message);
        return {
          department_id: dept.department_id,
          department_name: dept.department_name,
          department_code: dept.department_code,
          hod_name: dept.hod_name,
          teacher_id: null,
          teacher_name: null,
          teacher_email: null
        };
      }
    }));
    
    res.json({ success: true, data: hods });
  } catch (error) {
    console.error('Get HODs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch HODs', error: error.message });
  }
};

// Assign HOD to department
const assignHOD = async (req, res) => {
  try {
    const { department_id, teacher_id } = req.body;

    if (!department_id || !teacher_id) {
      return res.status(400).json({ success: false, message: 'Department ID and Teacher ID are required' });
    }

    // Get teacher name
    const [teachers] = await pool.execute('SELECT name FROM teachers WHERE id = ?', [teacher_id]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const teacherName = teachers[0].name;

    // Update department with HOD
    await pool.execute('UPDATE departments SET hod_name = ? WHERE id = ?', [teacherName, department_id]);

    res.json({ success: true, message: 'HOD assigned successfully' });
  } catch (error) {
    console.error('Assign HOD error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign HOD', error: error.message });
  }
};

// Remove HOD from department
const removeHOD = async (req, res) => {
  try {
    const { department_id } = req.params;

    await pool.execute('UPDATE departments SET hod_name = NULL WHERE id = ?', [department_id]);

    res.json({ success: true, message: 'HOD removed successfully' });
  } catch (error) {
    console.error('Remove HOD error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove HOD', error: error.message });
  }
};

// Get all departments
const getDepartments = async (req, res) => {
  try {
    // Get departments with student counts
    const [departments] = await pool.execute(
      `SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.hod_name,
        d.total_students,
        d.total_faculty,
        COALESCE((SELECT COUNT(*) FROM students WHERE department_id = d.id), 0) as actual_student_count
      FROM departments d
      ORDER BY d.name ASC`
    );
    
    // Format the response
    const formattedDepartments = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      description: dept.description || null,
      hod_name: dept.hod_name || null,
      total_students: dept.actual_student_count || dept.total_students || 0,
      total_faculty: dept.total_faculty || 0
    }));
    
    res.json({ success: true, data: formattedDepartments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch departments', error: error.message });
  }
};

// Enhanced statistics
const getEnhancedStatistics = async (req, res) => {
  try {
    const [teacherCount] = await pool.execute('SELECT COUNT(*) as count FROM teachers');
    const [studentCount] = await pool.execute('SELECT COUNT(*) as count FROM students');
    const [parentCount] = await pool.execute('SELECT COUNT(*) as count FROM parents');
    const [branchCount] = await pool.execute('SELECT COUNT(*) as count FROM branches');
    
    let departmentCount = 0;
    let hodCount = 0;
    let noticesCount = 0;
    
    try {
      const [deptCount] = await pool.execute('SELECT COUNT(*) as count FROM departments');
      departmentCount = deptCount[0].count;
      
      const [hodCountRows] = await pool.execute('SELECT COUNT(*) as count FROM departments WHERE hod_name IS NOT NULL AND hod_name != ""');
      hodCount = hodCountRows[0].count;
    } catch (err) {
      // Departments table might not exist
    }
    
    try {
      const [noticeCount] = await pool.execute('SELECT COUNT(*) as count FROM notices');
      noticesCount = noticeCount[0].count;
    } catch (err) {
      // Notices table might not exist
    }

    res.json({
      success: true,
      data: {
        teachers: teacherCount[0].count,
        students: studentCount[0].count,
        parents: parentCount[0].count,
        branches: branchCount[0].count,
        departments: departmentCount,
        hods: hodCount,
        notices: noticesCount
      }
    });
  } catch (error) {
    console.error('Get enhanced statistics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

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

// Update notice
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, recipient_type, branch_id, priority } = req.body;

    // Check if notice exists
    const [existing] = await pool.execute('SELECT id FROM notices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (message !== undefined) { updates.push('message = ?'); values.push(message); }
    if (recipient_type !== undefined) { updates.push('recipient_type = ?'); values.push(recipient_type); }
    if (branch_id !== undefined) { updates.push('branch_id = ?'); values.push(branch_id); }
    if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await pool.execute(`UPDATE notices SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    res.json({ success: true, message: 'Notice updated successfully' });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notice', error: error.message });
  }
};

// Delete notice
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notice exists
    const [existing] = await pool.execute('SELECT id FROM notices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await pool.execute('DELETE FROM notices WHERE id = ?', [id]);

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notice', error: error.message });
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
  // Existing
  getTeachers,
  getStudents,
  getParents,
  getStatistics,
  sendNotice,
  getNotices,
  updateNotice,
  deleteNotice,
  deleteUser,
  getBranches,
  // Student Management
  getStudentById,
  createStudent,
  updateStudent,
  // Teacher Management
  getTeacherById,
  createTeacher,
  updateTeacher,
  // Department Management
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  // Branch Management
  createBranch,
  updateBranch,
  deleteBranch,
  // HOD Management
  getHODs,
  assignHOD,
  removeHOD,
  // Enhanced Statistics
  getEnhancedStatistics
};

