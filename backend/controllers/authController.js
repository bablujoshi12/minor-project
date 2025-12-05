const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper: support both hashed and plain-text passwords (for older seed data)
const verifyPasswordWithFallback = async (plainPassword, storedPassword) => {
  // Check if storedPassword is NULL, undefined, or empty
  if (!storedPassword || (typeof storedPassword === 'string' && storedPassword.trim() === '')) {
    console.log('⚠️ Password verification failed: stored password is NULL or empty');
    return false;
  }

  // If looks like a bcrypt hash, try bcrypt.compare first
  const looksHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');

  if (looksHashed) {
    try {
      const isValid = await bcrypt.compare(plainPassword, storedPassword);
      console.log('🔐 Bcrypt password check:', isValid);
      return isValid;
    } catch (error) {
      console.warn('⚠️ Bcrypt compare error:', error.message);
      // fall through to plain check
    }
  }

  // Fallback: plain-text match (for existing demo users)
  const isPlainMatch = plainPassword === storedPassword;
  console.log('🔐 Plain password check:', isPlainMatch);
  return isPlainMatch;
};

// Register User
const register = async (req, res) => {
  try {
    const { 
      email, password, role, roll_no, section, name, branch, year, 
      father_name, mother_name, phone, blood_group, dob, 
      parent_email, parent_name, parent_phone
    } = req.body;

    if (!password || !name) {
      return res.status(400).json({ success: false, message: 'Password and name are required' });
    }
    
    // Email is recommended but not strictly required (student can use roll_no to login)
    // But for signup, we'll require it for better user management
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required for registration' });
    }

    // Validate role
    if (!['student', 'teacher', 'admin', 'parent'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Only students can signup directly
    if (role !== 'student') {
      return res.status(400).json({ success: false, message: 'Only students can signup. Admin and teachers are pre-created.' });
    }

    // Check if user exists
    const [existingUser] = await pool.execute('SELECT id FROM students WHERE email = ? OR roll_no = ?', [email, roll_no]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Student with this email or roll number already exists' });
    }

    // Get branch_id from branch code
    let branchId = null;
    let departmentId = null;
    if (branch) {
      const [branches] = await pool.execute('SELECT id, name FROM branches WHERE code = ?', [branch]);
      if (branches.length > 0) {
        branchId = branches[0].id;
        const branchName = branches[0].name;
        
        // Map branch to department by matching name
        // Branch names: Information Technology, Civil Engineering, Electronics Engineering, Pharmacy, Mechanical Engineering
        // Department names: Civil Engineering, Electronics Engineering, Information Technology, Pharmacy, Mechanical Engineering
        
        // Create mapping based on branch name
        let deptSearchName = branchName;
        
        // Special mapping for IT
        if (branch === 'IT' || branchName.includes('Information Technology')) {
          deptSearchName = 'Information Technology';
        } else if (branch === 'CIVIL' || branchName.includes('Civil')) {
          deptSearchName = 'Civil Engineering';
        } else if (branch === 'ELECTRONICS' || branchName.includes('Electronics')) {
          deptSearchName = 'Electronics Engineering';
        } else if (branch === 'PHARMACY' || branchName.includes('Pharmacy')) {
          deptSearchName = 'Pharmacy';
        } else if (branch === 'MECHANICAL' || branchName.includes('Mechanical')) {
          deptSearchName = 'Mechanical Engineering';
        }
        
        // Find department by name match
        const [departments] = await pool.execute(
          'SELECT id FROM departments WHERE name = ? OR name LIKE ? LIMIT 1',
          [deptSearchName, `%${deptSearchName}%`]
        );
        
        if (departments.length > 0) {
          departmentId = departments[0].id;
          console.log(`✅ Mapped branch "${branch}" (ID: ${branchId}) to department "${deptSearchName}" (ID: ${departmentId})`);
        } else {
          // Fallback: try to find by partial name match
          const [deptFallback] = await pool.execute(
            'SELECT id FROM departments WHERE name LIKE ? LIMIT 1',
            [`%${branch}%`]
          );
          if (deptFallback.length > 0) {
            departmentId = deptFallback[0].id;
            console.log(`⚠️ Mapped branch "${branch}" to department ID: ${departmentId} (fallback)`);
          } else {
            // Last resort: use branch_id as department_id (may not be correct but will prevent error)
            departmentId = branchId;
            console.log(`⚠️ Using branch_id ${branchId} as department_id (no match found)`);
          }
        }
      } else {
        return res.status(400).json({ success: false, message: 'Invalid branch code' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate required fields (after branch lookup)
    if (!roll_no || !roll_no.trim()) {
      return res.status(400).json({ success: false, message: 'Roll number is required' });
    }
    if (!branchId) {
      return res.status(400).json({ success: false, message: `Invalid branch "${branch}". Valid branches are: IT, CIVIL, ELECTRONICS, PHARMACY, MECHANICAL` });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required for registration' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Insert into students table (with proper column checking)
    try {
      // Check which columns exist in the table
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'`
      );
      const columnNames = columns.map(c => c.COLUMN_NAME);
      
      // Build dynamic INSERT query based on available columns
      const fields = [];
      const values = [];
      const placeholders = [];
      
      // Required fields
      if (columnNames.includes('roll_no')) { fields.push('roll_no'); values.push(roll_no); placeholders.push('?'); }
      if (columnNames.includes('name')) { fields.push('name'); values.push(name); placeholders.push('?'); }
      if (columnNames.includes('password')) { fields.push('password'); values.push(hashedPassword); placeholders.push('?'); }
      if (columnNames.includes('branch_id')) { fields.push('branch_id'); values.push(branchId); placeholders.push('?'); }
      // department_id is REQUIRED, so always include it if column exists
      if (columnNames.includes('department_id')) { 
        fields.push('department_id'); 
        values.push(departmentId || branchId || null); 
        placeholders.push('?'); 
      }
      if (columnNames.includes('email')) { fields.push('email'); values.push(email || null); placeholders.push('?'); }
      if (columnNames.includes('year')) { fields.push('year'); values.push(year ? parseInt(year) : 1); placeholders.push('?'); }
      if (columnNames.includes('section')) { fields.push('section'); values.push(section || null); placeholders.push('?'); }
      if (columnNames.includes('dob')) { fields.push('dob'); values.push(dob || null); placeholders.push('?'); }
      if (columnNames.includes('phone')) { fields.push('phone'); values.push(phone || null); placeholders.push('?'); }
      if (columnNames.includes('father_name')) { fields.push('father_name'); values.push(father_name || null); placeholders.push('?'); }
      if (columnNames.includes('mother_name')) { fields.push('mother_name'); values.push(mother_name || null); placeholders.push('?'); }
      if (columnNames.includes('parent_email')) { fields.push('parent_email'); values.push(parent_email || null); placeholders.push('?'); }
      if (columnNames.includes('parent_phone')) { fields.push('parent_phone'); values.push(parent_phone || phone || null); placeholders.push('?'); }
      if (columnNames.includes('blood_group')) { fields.push('blood_group'); values.push(blood_group || null); placeholders.push('?'); }
      // Set default status if column exists
      if (columnNames.includes('status')) { fields.push('status'); values.push('active'); placeholders.push('?'); }
      
      if (fields.length === 0) {
        return res.status(500).json({ 
          success: false, 
          message: 'No valid columns found in students table. Please check database structure.' 
        });
      }

      const query = `INSERT INTO students (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
      
      console.log('📝 Inserting student - Fields:', fields.join(', '));
      console.log('📝 Query:', query);
      console.log('📝 Values:', values.map((v, i) => `${fields[i]}: ${v === null ? 'NULL' : typeof v === 'string' ? v.substring(0, 50) : v}`));
      
      const [studentResult] = await pool.execute(query, values);
      
      console.log('✅ Student registration successful:', { roll_no, email, name, branchId, year, studentId: studentResult.insertId });

      const studentId = studentResult.insertId;

      // Create parent record if parent_email provided
      if (parent_email && parent_name) {
        try {
          await pool.execute(
            'INSERT INTO parents (email, name, phone, student_id) VALUES (?, ?, ?, ?)',
            [parent_email.trim(), parent_name.trim(), parent_phone || phone || null, studentId]
          );
          console.log('✅ Parent record created:', { email: parent_email, name: parent_name, studentId });
        } catch (parentError) {
          // If duplicate, try to update
          if (parentError.code === 'ER_DUP_ENTRY') {
            await pool.execute(
              'UPDATE parents SET name = ?, phone = ?, student_id = ? WHERE email = ?',
              [parent_name.trim(), parent_phone || phone || null, studentId, parent_email.trim()]
            );
            console.log('✅ Parent record updated:', { email: parent_email, name: parent_name, studentId });
          } else {
            console.log('⚠️ Parent creation skipped:', parentError.message);
          }
        }
      } else if (parent_email && !parent_name) {
        // If only parent_email provided without parent_name, use father_name or mother_name
        const parentName = father_name || mother_name || 'Parent';
        try {
          await pool.execute(
            'INSERT INTO parents (email, name, phone, student_id) VALUES (?, ?, ?, ?)',
            [parent_email.trim(), parentName.trim(), parent_phone || phone || null, studentId]
          );
          console.log('✅ Parent record created (using father/mother name):', { email: parent_email, name: parentName, studentId });
        } catch (parentError) {
          if (parentError.code === 'ER_DUP_ENTRY') {
            await pool.execute(
              'UPDATE parents SET name = ?, phone = ?, student_id = ? WHERE email = ?',
              [parentName.trim(), parent_phone || phone || null, studentId, parent_email.trim()]
            );
          }
        }
      }

      // Generate token
      const token = jwt.sign({ userId: studentId, role: 'student', email }, JWT_SECRET, { expiresIn: '7d' });

      // Get branch name
      let branchName = branch;
      if (branchId) {
        const [branchInfo] = await pool.execute('SELECT name FROM branches WHERE id = ?', [branchId]);
        if (branchInfo.length > 0) {
          branchName = branchInfo[0].name;
        }
      }

      res.status(201).json({
        success: true,
        message: 'Student registration successful',
        token,
        user: { 
          id: studentId, 
          email: email || null, 
          role: 'student',
          name, 
          roll_no,
          branch: branchName,
          branch_id: branchId,
          year: year ? parseInt(year) : 1
        }
      });
    } catch (dbError) {
      console.error('❌ Database error during registration:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      console.error('SQL State:', dbError.sqlState);
      
      // Check for duplicate entry
      if (dbError.code === 'ER_DUP_ENTRY') {
        if (dbError.sqlMessage && dbError.sqlMessage.includes('roll_no')) {
          return res.status(400).json({ success: false, message: 'This roll number is already registered' });
        }
        if (dbError.sqlMessage && dbError.sqlMessage.includes('email')) {
          return res.status(400).json({ success: false, message: 'This email is already registered' });
        }
        return res.status(400).json({ success: false, message: 'Duplicate entry. This student already exists.' });
      }
      
      // Check for foreign key constraint
      if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ success: false, message: 'Invalid branch selected. Please select a valid branch.' });
      }

      // Check for NOT NULL constraint violation
      if (dbError.code === 'ER_BAD_NULL_ERROR') {
        return res.status(400).json({ success: false, message: `Required field missing: ${dbError.sqlMessage || 'Please fill all required fields'}` });
      }

      // Check for NO DEFAULT FOR FIELD error
      if (dbError.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        const fieldName = dbError.sqlMessage ? dbError.sqlMessage.match(/Field '(.+?)' doesn't have a default value/)?.[1] : 'unknown';
        return res.status(400).json({ 
          success: false, 
          message: `Required field '${fieldName}' is missing. Please contact administrator.`,
          error: dbError.sqlMessage
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed. Please try again.',
        error: dbError.message || 'Database error',
        code: dbError.code,
        details: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
      });
    }
  } catch (error) {
    console.error('❌ Registration error (outer catch):', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.', 
      error: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password, roll_no, phone } = req.body;
    console.log('🔐 Login attempt:', { email, hasPassword: !!password, roll_no, phone });

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    let user = null;
    let userEmail = null;
    let userRole = null;
    let userId = null;
    let userData = {};

    // Admin Login
    if (email) {
      try {
        console.log('🔍 Checking admin login for email:', email);
        const [admins] = await pool.execute('SELECT * FROM admins WHERE email = ?', [email]);
        console.log('📊 Found admins:', admins.length);
        
        if (admins.length > 0) {
          const admin = admins[0];
          console.log('🔑 Admin found, checking password...');
          const isValidPassword = await verifyPasswordWithFallback(password, admin.password);
          console.log('🔐 Password valid:', isValidPassword);
          
          if (isValidPassword) {
            userRole = 'admin';
            userId = admin.id;
            userEmail = admin.email;
            userData = {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: 'admin'
            };
            console.log('✅ Admin login successful:', { userId, email: admin.email });
            
            // Generate token and return immediately (early return for better performance)
            const token = jwt.sign({ userId, role: userRole, email: userEmail }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({
              success: true,
              message: 'Login successful',
              token,
              user: userData
            });
          } else {
            console.log('❌ Invalid password for admin:', email);
            return res.status(401).json({ success: false, message: 'Invalid admin password. Please check your password.' });
          }
        } else {
          console.log('⚠️ Admin not found with email:', email);
        }
      } catch (adminError) {
        // If admins table doesn't exist, return error instead of continuing
        if (adminError.code === 'ER_NO_SUCH_TABLE') {
          console.error('❌ Admins table not found:', adminError.message);
          return res.status(500).json({ 
            success: false, 
            message: 'Database configuration error. Admins table not found. Please contact administrator.' 
          });
        } else {
          console.error('❌ Admin login error:', adminError);
          throw adminError;
        }
      }
    }

    // Teacher Login
    if (!userRole && email) {
      try {
        console.log('🔍 Checking teacher login for email:', email);
        const [teachers] = await pool.execute('SELECT * FROM teachers WHERE email = ?', [email]);
        console.log('📊 Found teachers:', teachers.length);
        
        if (teachers.length > 0) {
          const teacher = teachers[0];
          console.log('🔑 Teacher found, checking password...');
          const isValidPassword = await verifyPasswordWithFallback(password, teacher.password);
          console.log('🔐 Password valid:', isValidPassword);
          
          if (isValidPassword) {
            userRole = 'teacher';
            userId = teacher.id;
            userEmail = teacher.email;
            
            // Get branch info - handle if branches table doesn't exist
            let branchName = null;
            let branchCode = null;
            if (teacher.branch_id) {
              try {
                const [branchInfo] = await pool.execute('SELECT * FROM branches WHERE id = ?', [teacher.branch_id]);
                if (branchInfo.length > 0) {
                  branchName = branchInfo[0].name;
                  branchCode = branchInfo[0].code;
                }
              } catch (branchError) {
                console.warn('Error fetching branch info:', branchError.message);
              }
            }
            
            userData = {
              id: teacher.id,
              email: teacher.email,
              name: teacher.name,
              role: 'teacher',
              branch_id: teacher.branch_id,
              branch: branchName,
              branch_code: branchCode,
              phone: teacher.phone
            };
            console.log('✅ Teacher login successful:', { userId, email: teacher.email });
            
            // Generate token and return immediately (early return for better performance)
            const token = jwt.sign({ userId, role: userRole, email: userEmail }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({
              success: true,
              message: 'Login successful',
              token,
              user: userData
            });
          } else {
            console.log('❌ Invalid password for teacher:', email);
            return res.status(401).json({ success: false, message: 'Invalid teacher password. Please check your password.' });
          }
        } else {
          console.log('⚠️ Teacher not found with email:', email);
        }
      } catch (teacherError) {
        // If teachers table doesn't exist, log but continue to check students
        if (teacherError.code === 'ER_NO_SUCH_TABLE') {
          console.error('❌ Teachers table not found:', teacherError.message);
          return res.status(500).json({ 
            success: false, 
            message: 'Database configuration error. Teachers table not found. Please contact administrator.' 
          });
        } else {
          console.error('❌ Teacher login error:', teacherError);
          throw teacherError;
        }
      }
    }

    // Student Login (by email or roll_no)
    if (!userRole) {
      try {
        let student = null;
        
        if (roll_no) {
          // Login by roll number (preferred method)
          console.log('🔍 Checking student login by roll_no:', roll_no);
          const [students] = await pool.execute('SELECT * FROM students WHERE roll_no = ?', [roll_no]);
          student = students.length > 0 ? students[0] : null;
          console.log('📊 Student found by roll_no:', student ? 'Yes' : 'No');
          if (student) {
            console.log('📝 Student details:', { id: student.id, name: student.name, email: student.email, hasPassword: !!student.password });
          }
        } else if (email) {
          // Login by email (email can be null in database, so check for exact match)
          console.log('🔍 Checking student login by email:', email);
          const [students] = await pool.execute('SELECT * FROM students WHERE email = ? AND email IS NOT NULL', [email]);
          student = students.length > 0 ? students[0] : null;
          console.log('📊 Student found by email:', student ? 'Yes' : 'No');
          if (student) {
            console.log('📝 Student details:', { id: student.id, name: student.name, roll_no: student.roll_no, hasPassword: !!student.password });
          }
          // If not found by email, suggest using roll_no
          if (!student) {
            console.log('⚠️ Student not found by email. Suggesting to use roll_no instead.');
          }
        }

        if (student) {
          console.log('🔑 Student found, checking password...');
          console.log('📝 Student password exists:', !!student.password);
          
          // Check if password is NULL or empty
          if (!student.password || student.password.trim() === '') {
            console.log('❌ Student password is NULL or empty');
            return res.status(401).json({ 
              success: false, 
              message: 'Password not set. Please contact administrator to set your password.' 
            });
          }
          
          const isValidPassword = await verifyPasswordWithFallback(password, student.password);
          console.log('🔐 Password valid:', isValidPassword);
          
          if (isValidPassword) {
            userRole = 'student';
            userId = student.id;
            userEmail = student.email || student.roll_no;

            // Get branch info - handle if branches table doesn't exist
            let branchName = null;
            let branchCode = null;
            if (student.branch_id) {
              try {
                const [branchInfo] = await pool.execute('SELECT * FROM branches WHERE id = ?', [student.branch_id]);
                if (branchInfo.length > 0) {
                  branchName = branchInfo[0].name;
                  branchCode = branchInfo[0].code;
                }
              } catch (branchError) {
                console.warn('Error fetching branch info:', branchError.message);
              }
            }
            
            userData = {
              id: student.id,
              email: student.email || null,
              name: student.name,
              role: 'student',
              roll_no: student.roll_no,
              branch_id: student.branch_id,
              branch: branchName,
              branch_code: branchCode,
              year: student.year,
              section: student.section,
              phone: student.phone
            };
            
            console.log('✅ Student login successful:', { userId, roll_no: student.roll_no, email: student.email });
            
            // Generate token and return immediately (early return for better performance)
            const token = jwt.sign({ userId, role: userRole, email: userEmail }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({
              success: true,
              message: 'Login successful',
              token,
              user: userData
            });
          } else {
            console.log('❌ Invalid password for student:', roll_no || email);
            return res.status(401).json({ success: false, message: 'Invalid password. Please check your password.' });
          }
        } else {
          console.log('⚠️ Student not found:', { roll_no, email });
          let errorMessage = 'Student not found. ';
          if (email && !roll_no) {
            errorMessage += 'Please try logging in with your roll number instead, or sign up if you are a new student.';
          } else if (roll_no) {
            errorMessage += 'Please check your roll number or sign up if you are a new student.';
          } else {
            errorMessage += 'Please provide email or roll number to login.';
          }
          return res.status(401).json({ 
            success: false, 
            message: errorMessage
          });
        }
      } catch (studentError) {
        // If students table doesn't exist, return helpful error
        console.error('❌ Student login error:', studentError);
        if (studentError.code === 'ER_NO_SUCH_TABLE') {
          console.error('❌ Students table not found:', studentError.message);
          return res.status(500).json({ 
            success: false, 
            message: 'Database configuration error. Students table not found. Please contact administrator.' 
          });
        } else {
          throw studentError;
        }
      }
    }

    if (!userRole || !userId) {
      console.log('❌ No user found after checking all roles:', { email, roll_no, hasEmail: !!email, hasRollNo: !!roll_no });
      // More specific error message
      if (email && !userRole) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials. Please check your email and password, or try signing up if you are a new user.' 
        });
      } else if (roll_no && !userRole) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials. Please check your roll number and password, or try signing up if you are a new student.' 
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials. Please check your login details.' 
        });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    // More helpful error message
    let errorMessage = 'Login failed. Please try again.';
    if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Database configuration error. Please contact administrator.';
    } else if (error.message) {
      errorMessage = `Login failed: ${error.message}`;
    }
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Parent Login
const parentLogin = async (req, res) => {
  try {
    const { email, roll_no, dob } = req.body;

    if (!email && (!roll_no || !dob)) {
      return res.status(400).json({ success: false, message: 'Parent email OR (student roll number + DOB) is required' });
    }

    let student = null;
    let parent = null;

    // Login by parent email
    if (email) {
      try {
        console.log('🔍 Checking parent login by email:', email);
        // First try to find in parents table
        const [parents] = await pool.execute('SELECT * FROM parents WHERE email = ?', [email]);
        console.log('📊 Found parents in parents table:', parents.length);
        
        if (parents.length > 0) {
          parent = parents[0];
          try {
            const [students] = await pool.execute('SELECT * FROM students WHERE id = ?', [parent.student_id]);
            if (students.length > 0) {
              student = students[0];
              console.log('✅ Found student for parent:', student.roll_no);
            }
          } catch (studentError) {
            console.warn('⚠️ Error fetching student for parent:', studentError.message);
          }
        } else {
          // If not found in parents table, try to find student by parent_email
          console.log('🔍 Checking students table for parent_email:', email);
          try {
            const [students] = await pool.execute('SELECT * FROM students WHERE parent_email = ?', [email]);
            console.log('📊 Found students with parent_email:', students.length);
            
            if (students.length > 0) {
              student = students[0];
              console.log('✅ Found student by parent_email:', student.roll_no);
              // Try to create parent record from student data if not exists
              if (student.parent_email && !parent) {
                try {
                  const [parentInsert] = await pool.execute(
                    'INSERT INTO parents (email, name, phone, student_id) VALUES (?, ?, ?, ?)',
                    [student.parent_email, student.father_name || student.mother_name || 'Parent', student.parent_phone || student.phone || null, student.id]
                  );
                  const [newParents] = await pool.execute('SELECT * FROM parents WHERE id = ?', [parentInsert.insertId]);
                  if (newParents.length > 0) {
                    parent = newParents[0];
                  }
                } catch (parentErr) {
                  // If insert fails (duplicate), try to get existing parent
                  if (parentErr.code === 'ER_DUP_ENTRY') {
                    try {
                      const [existingParents] = await pool.execute('SELECT * FROM parents WHERE email = ?', [email]);
                      if (existingParents.length > 0) {
                        parent = existingParents[0];
                      }
                    } catch (fetchErr) {
                      console.warn('Error fetching existing parent:', fetchErr.message);
                    }
                  }
                }
              }
            }
          } catch (studentError) {
            if (studentError.code === 'ER_NO_SUCH_TABLE') {
              console.error('Students table not found');
              return res.status(500).json({ success: false, message: 'Database configuration error. Please contact administrator.' });
            }
            throw studentError;
          }
        }
      } catch (parentError) {
        if (parentError.code === 'ER_NO_SUCH_TABLE') {
          console.error('Parents table not found');
          return res.status(500).json({ success: false, message: 'Database configuration error. Please contact administrator.' });
        }
        throw parentError;
      }
    }

    // Login by student roll_no + DOB
    if (!student && roll_no && dob) {
      try {
        console.log('🔍 Checking parent login by roll_no + DOB:', { roll_no, dob });
        const [students] = await pool.execute('SELECT * FROM students WHERE roll_no = ? AND dob = ?', [roll_no, dob]);
        console.log('📊 Found students with roll_no + DOB:', students.length);
        
        if (students.length > 0) {
          student = students[0];
          console.log('✅ Found student by roll_no + DOB:', student.roll_no);
          // Find parent by student_id or parent_email
          if (student.parent_email) {
            try {
              const [parents] = await pool.execute('SELECT * FROM parents WHERE student_id = ? OR email = ?', [student.id, student.parent_email]);
              if (parents.length > 0) {
                parent = parents[0];
              } else {
                // Create parent record from student data if parent_email exists
                try {
                  const [parentInsert] = await pool.execute(
                    'INSERT INTO parents (email, name, phone, student_id) VALUES (?, ?, ?, ?)',
                    [student.parent_email, student.father_name || student.mother_name || 'Parent', student.parent_phone || student.phone || null, student.id]
                  );
                  const [newParents] = await pool.execute('SELECT * FROM parents WHERE id = ?', [parentInsert.insertId]);
                  if (newParents.length > 0) {
                    parent = newParents[0];
                  }
                } catch (parentErr) {
                  // Ignore duplicate entry errors
                  console.log('Parent record creation skipped:', parentErr.message);
                }
              }
            } catch (parentError) {
              console.warn('Error fetching parent:', parentError.message);
            }
          }
        }
      } catch (studentError) {
        if (studentError.code === 'ER_NO_SUCH_TABLE') {
          console.error('Students table not found');
          return res.status(500).json({ success: false, message: 'Database configuration error. Please contact administrator.' });
        }
        throw studentError;
      }
    }

    if (!student) {
      console.log('❌ Parent login failed: Student not found', { email, roll_no, dob: dob ? 'provided' : 'missing' });
      return res.status(401).json({ success: false, message: 'Invalid parent credentials. Student not found. Please check your email/roll number and DOB.' });
    }
    
    console.log('✅ Parent login successful, generating token for student:', student.roll_no);

    // Get branch info - handle if branches table doesn't exist
    let branchName = null;
    let branchCode = null;
    if (student.branch_id) {
      try {
        const [branchInfo] = await pool.execute('SELECT * FROM branches WHERE id = ?', [student.branch_id]);
        if (branchInfo.length > 0) {
          branchName = branchInfo[0].name;
          branchCode = branchInfo[0].code;
        }
      } catch (branchError) {
        console.warn('Error fetching branch info:', branchError.message);
      }
    }

    // Ensure parent record exists (create if doesn't exist)
    if (!parent && student) {
      try {
        const parentEmail = student.parent_email || email;
        const parentName = student.father_name || student.mother_name || 'Parent';
        
        // Try to create parent record
        const [parentInsert] = await pool.execute(
          'INSERT INTO parents (email, name, phone, student_id) VALUES (?, ?, ?, ?)',
          [parentEmail, parentName, student.parent_phone || student.phone || null, student.id]
        );
        
        const [newParents] = await pool.execute('SELECT * FROM parents WHERE id = ?', [parentInsert.insertId]);
        if (newParents.length > 0) {
          parent = newParents[0];
          console.log('✅ Created parent record:', { id: parent.id, email: parent.email, student_id: student.id });
        }
      } catch (parentErr) {
        // If duplicate entry, fetch existing parent
        if (parentErr.code === 'ER_DUP_ENTRY') {
          const [existingParents] = await pool.execute(
            'SELECT * FROM parents WHERE email = ? OR student_id = ?',
            [student.parent_email || email, student.id]
          );
          if (existingParents.length > 0) {
            parent = existingParents[0];
            console.log('✅ Found existing parent record:', { id: parent.id, email: parent.email });
          }
        } else {
          console.warn('⚠️ Could not create parent record:', parentErr.message);
        }
      }
    }

    // Generate token (no password required for parent login)
    const token = jwt.sign(
      { 
        userId: parent ? parent.id : student.id, 
        role: 'parent', 
        email: parent ? parent.email : (student.parent_email || email),
        studentId: student.id
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Parent login successful',
      token,
      user: {
        id: parent ? parent.id : student.id,
        email: parent ? parent.email : student.parent_email,
        name: parent ? parent.name : (student.father_name || student.mother_name || 'Parent'),
        role: 'parent',
        student_id: student.id,
        student: {
          id: student.id,
          name: student.name,
          roll_no: student.roll_no,
          email: student.email,
          branch: branchName,
          branch_code: branchCode,
          year: student.year,
          section: student.section
        }
      }
    });
  } catch (error) {
    console.error('Parent login error:', error);
    let errorMessage = 'Parent login failed. Please try again.';
    if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Database configuration error. Please contact administrator.';
    } else if (error.message) {
      errorMessage = `Parent login failed: ${error.message}`;
    }
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { register, login, parentLogin };
