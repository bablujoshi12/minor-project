// Backend Server for GPL Lohaghat Smart Campus Portal
// Express.js server with MySQL database connection

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== API ROUTES ==========
// Mount auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Mount admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Mount teacher routes
const teacherRoutes = require('./routes/teacher');
app.use('/api/teacher', teacherRoutes);

// Mount student routes
const studentRoutes = require('./routes/student');
app.use('/api/student', studentRoutes);

// Mount parent routes
const parentRoutes = require('./routes/parent');
app.use('/api/parent', parentRoutes);

// Mount chatbot routes
const chatbotRoutes = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRoutes);

// Mount notes board routes
const notesBoardRoutes = require('./routes/notesBoard');
app.use('/api/notes-board', notesBoardRoutes);

// Mount public students routes (for chatbot)
const studentsRoutes = require('./routes/students');
app.use('/api/students', studentsRoutes);

// Mount departments routes
const departmentsRoutes = require('./routes/departments');
app.use('/api/departments', departmentsRoutes);

// Mount faculty routes
const facultyRoutes = require('./routes/faculty');
app.use('/api/faculty', facultyRoutes);

// Mount NSS/NCC routes
const nssNccRoutes = require('./routes/nssNcc');
app.use('/api', nssNccRoutes);

// Mount subjects routes
const subjectsRoutes = require('./routes/subjects');
app.use('/api/subjects', subjectsRoutes);

// Mount file download routes
const fileController = require('./controllers/fileController');
app.get('/api/files/assignment/:assignmentId', require('./middleware/auth').authenticate, fileController.downloadAssignment);

// Serve static images from public/images folder
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Serve uploaded assignments (student/teacher uploads) - URLs like /uploads/assignments/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve images from local desktop folder (C:\Users\ASUS\Desktop\image)
// This allows accessing local images via /api/local-images/:filename
const localImagesPath = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Desktop', 'image');
if (fs.existsSync(localImagesPath)) {
  app.use('/api/local-images', express.static(localImagesPath));
  console.log(`✅ Local images folder found: ${localImagesPath}`);
  console.log(`📁 Images accessible via: http://localhost:${PORT}/api/local-images/[filename]`);
} else {
  console.log(`⚠️ Local images folder not found: ${localImagesPath}`);
}

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_campus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.log('Please check your database configuration in .env file');
  });

// ========== HELPER FUNCTION ==========
// Convert local file paths to accessible URLs
function convertImagePath(imageUrl) {
  if (!imageUrl) return '';
  
  // If already a URL (http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If starts with /images/, it's a public folder image
  if (imageUrl.startsWith('/images/')) {
    return imageUrl;
  }
  
  // Check if it's a Windows local path (C:\ or \)
  if (imageUrl.includes(':\\') || imageUrl.startsWith('\\') || imageUrl.startsWith('C:\\')) {
    // Extract filename from local path
    const filename = path.basename(imageUrl);
    // Convert to accessible URL
    return `http://localhost:${PORT}/api/local-images/${encodeURIComponent(filename)}`;
  }
  
  // If it's just a filename, assume it's in local-images folder
  if (!imageUrl.includes('/') && !imageUrl.includes('\\')) {
    return `http://localhost:${PORT}/api/local-images/${encodeURIComponent(imageUrl)}`;
  }
  
  // Default: return as is (might be relative path)
  return imageUrl;
}

// ========== GALLERY API ROUTES ==========

/**
 * GET /api/local-images-list
 * List all images from local Desktop/image folder
 */
app.get('/api/local-images-list', (req, res) => {
  try {
    if (!fs.existsSync(localImagesPath)) {
      return res.json({
        success: false,
        message: 'Local images folder not found',
        path: localImagesPath,
        images: []
      });
    }
    
    const files = fs.readdirSync(localImagesPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
    });
    
    const images = imageFiles.map((file, index) => ({
      filename: file,
      url: `http://localhost:${PORT}/api/local-images/${encodeURIComponent(file)}`,
      path: path.join(localImagesPath, file)
    }));
    
    res.json({
      success: true,
      path: localImagesPath,
      count: images.length,
      images: images
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reading local images folder',
      error: error.message
    });
  }
});

/**
 * GET /api/gallery
 * Get all active gallery images for slide gallery
 */
app.get('/api/gallery', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get all active images ordered by display_order
    const [rows] = await connection.query(
      `SELECT 
        id,
        image_url,
        image_title,
        category,
        alt_text,
        display_order
      FROM gallery_images 
      WHERE is_active = 1 
      ORDER BY display_order ASC, id ASC`
    );
    
    connection.release();
    
    console.log(`📸 Gallery API: Found ${rows.length} images in database`);
    
    // Convert image URLs to accessible paths
    const processedRows = rows.map(row => ({
      ...row,
      image_url: convertImagePath(row.image_url)
    }));
    
    // Return just the image URLs array for slide gallery (converted to accessible URLs)
    const imageUrls = processedRows.map(row => row.image_url).filter(url => url && url.trim() !== '');
    
    if (imageUrls.length === 0) {
      console.log('⚠️ No images found in database. Please insert images using database/gallery_table.sql');
      // Return empty array instead of error so frontend can use fallback
      return res.json({
        success: true,
        data: [],
        images: [],
        count: 0,
        message: 'No images found in database'
      });
    }
    
    res.json({
      success: true,
      data: imageUrls, // For slide gallery, just URLs (now converted)
      images: processedRows,     // Full image objects if needed
      count: imageUrls.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching gallery images:', error.message);
    
    // If table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
      console.log('⚠️ Gallery table not found. Please run: mysql -u root -p < database/gallery_table.sql');
      return res.json({
        success: true,
        data: [],
        images: [],
        count: 0,
        message: 'Gallery table not found. Please set up the database.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery images',
      error: error.message
    });
  }
});

/**
 * GET /api/gallery/full
 * Get all gallery images with full details
 */
app.get('/api/gallery/full', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      `SELECT 
        id,
        image_url,
        image_title,
        category,
        alt_text,
        display_order,
        is_active,
        created_at,
        updated_at
      FROM gallery_images 
      WHERE is_active = 1 
      ORDER BY display_order ASC, id ASC`
    );
    
    connection.release();
    
    // Convert image URLs to accessible paths
    const processedRows = rows.map(row => ({
      ...row,
      image_url: convertImagePath(row.image_url)
    }));
    
    res.json({
      success: true,
      data: processedRows,
      count: processedRows.length
    });
    
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery images',
      error: error.message
    });
  }
});

/**
 * GET /api/gallery/category/:category
 * Get images by category
 */
app.get('/api/gallery/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      `SELECT 
        id,
        image_url,
        image_title,
        category,
        alt_text,
        display_order
      FROM gallery_images 
      WHERE is_active = 1 AND category = ?
      ORDER BY display_order ASC, id ASC`,
      [category]
    );
    
    connection.release();
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching gallery by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery images',
      error: error.message
    });
  }
});

/**
 * POST /api/gallery
 * Add new gallery image
 */
app.post('/api/gallery', async (req, res) => {
  try {
    const { image_url, image_title, category, alt_text, display_order } = req.body;
    
    if (!image_url || !image_title) {
      return res.status(400).json({
        success: false,
        message: 'image_url and image_title are required'
      });
    }
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO gallery_images 
        (image_url, image_title, category, alt_text, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, 1)`,
      [
        image_url,
        image_title,
        category || 'Campus',
        alt_text || image_title,
        display_order || 0
      ]
    );
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Image added successfully',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error adding gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding gallery image',
      error: error.message
    });
  }
});

/**
 * PUT /api/gallery/:id
 * Update gallery image
 */
app.put('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, image_title, category, alt_text, display_order, is_active } = req.body;
    
    const connection = await pool.getConnection();
    
    const updateFields = [];
    const updateValues = [];
    
    if (image_url) { updateFields.push('image_url = ?'); updateValues.push(image_url); }
    if (image_title) { updateFields.push('image_title = ?'); updateValues.push(image_title); }
    if (category) { updateFields.push('category = ?'); updateValues.push(category); }
    if (alt_text) { updateFields.push('alt_text = ?'); updateValues.push(alt_text); }
    if (display_order !== undefined) { updateFields.push('display_order = ?'); updateValues.push(display_order); }
    if (is_active !== undefined) { updateFields.push('is_active = ?'); updateValues.push(is_active); }
    
    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updateValues.push(id);
    
    await connection.query(
      `UPDATE gallery_images 
      SET ${updateFields.join(', ')}
      WHERE id = ?`,
      updateValues
    );
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Image updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating gallery image',
      error: error.message
    });
  }
});

/**
 * DELETE /api/gallery/:id
 * Delete gallery image (soft delete - sets is_active to 0)
 */
app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE gallery_images SET is_active = 0 WHERE id = ?',
      [id]
    );
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting gallery image',
      error: error.message
    });
  }
});

// ========== DEPARTMENTS API ROUTES ==========

/**
 * GET /api/departments
 * Get all active departments with full details
 */
app.get('/api/departments', async (req, res) => {
  try {
    // Get departments with actual columns
    const [departments] = await pool.query(
      `SELECT 
        id,
        name,
        code,
        description,
        hod_name,
        total_students,
        total_faculty
      FROM departments
      ORDER BY id ASC`
    );
    
    // Map departments to expected format
    const formattedDepartments = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      students: dept.total_students || 0,
      teachers: dept.total_faculty || 0,
      hod: dept.hod_name || '',
      icon: '🏛️',
      color: '#667eea',
      facultyList: [],
      studentList: []
    }));
    
    // Try to get additional data if tables exist (optional)
    for (let dept of formattedDepartments) {
      try {
        const [faculty] = await pool.query(
          `SELECT name, designation, is_hod 
           FROM department_faculty 
           WHERE department_id = ? 
           ORDER BY is_hod DESC, display_order ASC
           LIMIT 10`,
          [dept.id]
        );
        dept.facultyList = faculty.map(f => 
          `${f.name}${f.is_hod ? ' - HOD' : f.designation ? ' - ' + f.designation : ''}`
        );
      } catch (err) {
        // Table doesn't exist, skip
      }
      
      try {
        const [students] = await pool.query(
          `SELECT year, student_names, student_count 
           FROM department_students 
           WHERE department_id = ? 
           ORDER BY year ASC
           LIMIT 10`,
          [dept.id]
        );
        dept.studentList = students.map(s => 
          `YEAR ${s.year}: ${s.student_names || ''} (${s.student_count} students)`
        );
      } catch (err) {
        // Table doesn't exist, skip
      }
    }
    
    res.json({
      success: true,
      data: formattedDepartments,
      count: formattedDepartments.length
    });
    
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
});

// ========== FEATURES API ROUTES ==========

/**
 * GET /api/features
 * Get all active features
 */
app.get('/api/features', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      `SELECT 
        icon,
        title,
        description,
        background_gradient as bg,
        link,
        display_order
      FROM features 
      WHERE is_active = 1 
      ORDER BY display_order ASC, id ASC`
    );
    
    connection.release();
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching features:', error);
    // If table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('Features table does not exist, returning empty array');
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching features',
      error: error.message
    });
  }
});

// ========== PLACEMENT DETAILS API ==========

/**
 * GET /api/placement
 * Get placement details
 */
app.get('/api/placement', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      `SELECT 
        percentage,
        package_range,
        companies,
        sectors
      FROM placement_details 
      ORDER BY id DESC 
      LIMIT 1`
    );
    
    connection.release();
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        data: {
          percentage: 0,
          packages: '',
          companies: [],
          sectors: []
        }
      });
    }
    
    const placement = rows[0];
    let companies = [];
    let sectors = [];
    
    try {
      companies = typeof placement.companies === 'string' 
        ? JSON.parse(placement.companies) 
        : placement.companies || [];
    } catch (e) {
      companies = placement.companies ? placement.companies.split(',') : [];
    }
    
    try {
      sectors = typeof placement.sectors === 'string' 
        ? JSON.parse(placement.sectors) 
        : placement.sectors || [];
    } catch (e) {
      sectors = placement.sectors ? placement.sectors.split(',') : [];
    }
    
    res.json({
      success: true,
      data: {
        percentage: placement.percentage || 0,
        packages: placement.package_range || '',
        companies: companies,
        sectors: sectors
      }
    });
    
  } catch (error) {
    console.error('Error fetching placement details:', error);
    // Return empty data instead of error if table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return res.json({
        success: true,
        data: {
          percentage: 0,
          packages: '',
          companies: [],
          sectors: []
        }
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching placement details',
      error: error.message
    });
  }
});

// ========== EVENTS API ROUTES ==========

/**
 * GET /api/events
 * Get all active events
 */
app.get('/api/events', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      `SELECT 
        id,
        title,
        description,
        display_date as date,
        location,
        image_url,
        category
      FROM events 
      WHERE is_active = 1 
      ORDER BY display_order ASC, event_date DESC 
      LIMIT 10`
    );
    
    connection.release();
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    // Return empty array instead of error if table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    res.json({
      success: true,
      message: 'Server is running and database is connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
  res.status(500).json({ 
    success: false, 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GPL Lohaghat Smart Campus Portal API',
    version: '1.0.0',
    endpoints: {
      gallery: '/api/gallery',
      departments: '/api/departments',
      features: '/api/features',
      placement: '/api/placement',
      events: '/api/events',
      health: '/api/health'
    }
  });
});

// ========== HOMEPAGE DATA API ROUTES ==========

/**
 * GET /api/homepage/departments
 * Get all active departments with real student and teacher details
 */
app.get('/api/homepage/departments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id,
        name,
        code,
        description,
        hod_name,
        total_students,
        total_faculty
      FROM departments 
      ORDER BY id ASC`
    );
    
    // Map to expected format and fetch real data
    const departments = await Promise.all(rows.map(async (row) => {
      const dept = {
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description || '',
        students: row.total_students || 0,
        teachers: row.total_faculty || 0,
        hod: row.hod_name || '',
        icon: '🏛️', // Default icon
        color: '#667eea', // Default color
        facultyList: [],
        studentList: []
      };

      // Fetch real faculty members from faculty table for this department
      try {
        // First try faculty table (has department_id)
        const [facultyRows] = await pool.query(
          `SELECT name, designation, qualification, email, phone
           FROM faculty 
           WHERE department_id = ? AND status = 'active'
           ORDER BY name ASC`,
          [row.id]
        );
        
        if (facultyRows.length > 0) {
          // Show all faculty members from faculty table
          dept.facultyList = facultyRows.map(f => {
            let facultyStr = f.name;
            if (f.designation) {
              facultyStr += ` - ${f.designation}`;
            }
            if (f.qualification) {
              facultyStr += ` (${f.qualification})`;
            }
            return facultyStr;
          });
          // Update teachers count to match actual faculty count
          dept.teachers = facultyRows.length;
          console.log(`📋 Department ${row.name} (ID: ${row.id}): Found ${facultyRows.length} faculty members from faculty table`);
        } else {
          // Fallback: Get teachers from teachers table by matching through students
          // Teachers are linked to branches, students have both branch_id and department_id
          const [teacherRows] = await pool.query(
            `SELECT DISTINCT t.id, t.name, t.email, t.phone
             FROM teachers t
             INNER JOIN students s ON t.branch_id = s.branch_id
             WHERE s.department_id = ?
             GROUP BY t.id, t.name, t.email, t.phone
             ORDER BY t.name ASC`,
            [row.id]
          );
          
          if (teacherRows.length > 0) {
            dept.facultyList = teacherRows.map(t => t.name);
            dept.teachers = teacherRows.length;
            console.log(`📋 Department ${row.name} (ID: ${row.id}): Found ${teacherRows.length} teachers from teachers table`);
          } else {
            dept.facultyList = [];
            console.log(`⚠️ No faculty/teachers found for department ${row.name} (ID: ${row.id})`);
          }
        }
      } catch (facultyErr) {
        console.error(`❌ Error fetching faculty for department ${row.id} (${row.name}):`, facultyErr.message);
        dept.facultyList = [];
      }

      // Fetch real students from students table grouped by year
      try {
        const [studentRows] = await pool.query(
          `SELECT 
            s.id,
            s.name,
            s.roll_no,
            s.year,
            s.semester,
            s.section,
            s.email,
            s.phone
           FROM students s
           WHERE s.department_id = ? AND s.status = 'active'
           ORDER BY s.year ASC, s.roll_no ASC`,
          [row.id]
        );
        
        console.log(`📚 Department ${row.name} (ID: ${row.id}): Found ${studentRows.length} students`);
        
        if (studentRows.length > 0) {
          // Update students count to match actual count from students table
          dept.students = studentRows.length;
          
          // Group students by year
          const studentsByYear = {};
          studentRows.forEach(student => {
            const year = student.year || 'N/A';
            if (!studentsByYear[year]) {
              studentsByYear[year] = [];
            }
            studentsByYear[year].push(student);
          });

          // Format student list by year - show all students
          dept.studentList = Object.keys(studentsByYear).sort().map(year => {
            const yearStudents = studentsByYear[year];
            // Show first 15 students, then mention remaining
            const studentNames = yearStudents.slice(0, 15).map(s => s.name).join(', ');
            const totalCount = yearStudents.length;
            const moreText = totalCount > 15 ? ` and ${totalCount - 15} more` : '';
            return `YEAR ${year}: ${studentNames}${moreText} (${totalCount} students)`;
          });
        } else {
          // No students found in students table
          dept.studentList = [];
          console.log(`⚠️ No students found for department ${row.name} (ID: ${row.id})`);
        }
      } catch (studentErr) {
        console.error(`❌ Error fetching students for department ${row.id} (${row.name}):`, studentErr.message);
        console.error('Error details:', studentErr);
        dept.studentList = [];
      }

      return dept;
    }));
    
    res.json({
      success: true,
      data: departments,
      count: departments.length
    });
    
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
});

/**
 * GET /api/homepage/features
 * Get all active homepage features
 */
app.get('/api/homepage/features', async (req, res) => {
  try {
    // Try homepage_features first, fallback to features table
    let rows = [];
    try {
      [rows] = await pool.query(
        `SELECT 
          id,
          icon,
          title,
          description,
          bg_gradient,
          link_url,
          display_order
        FROM homepage_features 
        WHERE is_active = 1 
        ORDER BY display_order ASC, id ASC`
      );
    } catch (err) {
      // Fallback to features table if homepage_features doesn't exist
      if (err.code === 'ER_NO_SUCH_TABLE') {
        try {
          [rows] = await pool.query(
            `SELECT 
              id,
              icon,
              title,
              description,
              bg_gradient as bg,
              link_url as link
            FROM features 
            ORDER BY id ASC
            LIMIT 10`
          );
        } catch (err2) {
          // If features table also doesn't exist, use empty array
          if (err2.code === 'ER_NO_SUCH_TABLE') {
            console.log('Features table does not exist, returning empty array');
            rows = [];
          } else {
            throw err2;
          }
        }
      } else {
        throw err;
      }
    }
    
    const features = rows.map(row => ({
      id: row.id,
      icon: row.icon || '✨',
      title: row.title,
      description: row.description,
      bg: row.bg_gradient || row.bg || '#667eea',
      link: row.link_url || row.link || ''
    }));
    
    res.json({
      success: true,
      data: features,
      count: features.length
    });
    
  } catch (error) {
    console.error('Error fetching features:', error);
    // Return empty array instead of error
    res.json({
      success: true,
      data: [],
      count: 0
    });
  }
});

/**
 * GET /api/homepage/events
 * Get all active events (upcoming)
 */
app.get('/api/homepage/events', async (req, res) => {
  try {
    // Try homepage_events first, fallback to events table
    let rows = [];
    try {
      [rows] = await pool.query(
        `SELECT 
          id,
          title,
          date,
          location,
          description,
          image_url,
          link_url,
          display_order
        FROM homepage_events 
        WHERE is_active = 1 
        ORDER BY date ASC, display_order ASC 
        LIMIT 10`
      );
    } catch (err) {
      // Fallback to events table if homepage_events doesn't exist
      [rows] = await pool.query(
        `SELECT 
          id,
          title,
          event_date AS date,
          location,
          description,
          NULL AS image_url,
          NULL AS link_url
        FROM events 
        ORDER BY event_date ASC
        LIMIT 10`
      );
    }
    
    const events = rows.map(row => {
      try {
        const eventDate = new Date(row.date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${eventDate.getDate()} ${months[eventDate.getMonth()]}`;
        return {
          id: row.id,
          date: formattedDate,
          title: row.title,
          time: '09:00 AM',
          location: row.location || '',
          description: row.description,
          image_url: row.image_url,
          link_url: row.link_url
        };
      } catch (e) {
        return {
          id: row.id,
          date: row.date || '',
          title: row.title,
          time: '09:00 AM',
          location: row.location || '',
          description: row.description,
          image_url: row.image_url,
          link_url: row.link_url
        };
      }
    });
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

/**
 * GET /api/homepage/all
 * Get all homepage data in one call
 */
app.get('/api/homepage/all', async (req, res) => {
  try {
    // Get departments - use actual columns with real student and teacher data
    let departments = [];
    try {
      const [deptRows] = await pool.query(
        `SELECT id, name, code, description, hod_name, total_students, total_faculty
         FROM departments ORDER BY id ASC`
      );
      
      departments = await Promise.all(deptRows.map(async (row) => {
        const dept = {
          id: row.id,
          name: row.name,
          code: row.code,
          description: row.description || '',
          students: row.total_students || 0,
          teachers: row.total_faculty || 0,
          hod: row.hod_name || '',
          icon: '🏛️',
          color: '#667eea',
          facultyList: [],
          studentList: []
        };

        // Fetch real faculty members from faculty table for this department
        try {
          // First try faculty table (has department_id)
          const [facultyRows] = await pool.query(
            `SELECT name, designation, qualification, email, phone
             FROM faculty 
             WHERE department_id = ? AND status = 'active'
             ORDER BY name ASC`,
            [row.id]
          );
          
          if (facultyRows.length > 0) {
            // Show all faculty members from faculty table
            dept.facultyList = facultyRows.map(f => {
              let facultyStr = f.name;
              if (f.designation) {
                facultyStr += ` - ${f.designation}`;
              }
              if (f.qualification) {
                facultyStr += ` (${f.qualification})`;
              }
              return facultyStr;
            });
            // Update teachers count to match actual faculty count
            dept.teachers = facultyRows.length;
            console.log(`📋 Department ${row.name} (ID: ${row.id}): Found ${facultyRows.length} faculty members from faculty table`);
          } else {
            // Fallback: Get teachers from teachers table by matching through students
            // Teachers are linked to branches, students have both branch_id and department_id
            const [teacherRows] = await pool.query(
              `SELECT DISTINCT t.id, t.name, t.email, t.phone
               FROM teachers t
               INNER JOIN students s ON t.branch_id = s.branch_id
               WHERE s.department_id = ?
               GROUP BY t.id, t.name, t.email, t.phone
               ORDER BY t.name ASC`,
              [row.id]
            );
            
            if (teacherRows.length > 0) {
              dept.facultyList = teacherRows.map(t => t.name);
              dept.teachers = teacherRows.length;
              console.log(`📋 Department ${row.name} (ID: ${row.id}): Found ${teacherRows.length} teachers from teachers table`);
            } else {
              dept.facultyList = [];
              console.log(`⚠️ No faculty/teachers found for department ${row.name} (ID: ${row.id})`);
            }
          }
        } catch (facultyErr) {
          console.error(`❌ Error fetching faculty for department ${row.id} (${row.name}):`, facultyErr.message);
          dept.facultyList = [];
        }

        // Fetch real students from students table grouped by year
        try {
          const [studentRows] = await pool.query(
            `SELECT 
              s.id,
              s.name,
              s.roll_no,
              s.year,
              s.semester,
              s.section,
              s.email,
              s.phone
             FROM students s
             WHERE s.department_id = ? AND s.status = 'active'
             ORDER BY s.year ASC, s.roll_no ASC`,
            [row.id]
          );
          
          console.log(`📚 Department ${row.name} (ID: ${row.id}): Found ${studentRows.length} students`);
          
          if (studentRows.length > 0) {
            // Update students count to match actual count from students table
            dept.students = studentRows.length;
            
            // Group students by year
            const studentsByYear = {};
            studentRows.forEach(student => {
              const year = student.year || 'N/A';
              if (!studentsByYear[year]) {
                studentsByYear[year] = [];
              }
              studentsByYear[year].push(student);
            });

            // Format student list by year - show all students
            dept.studentList = Object.keys(studentsByYear).sort().map(year => {
              const yearStudents = studentsByYear[year];
              // Show first 15 students, then mention remaining
              const studentNames = yearStudents.slice(0, 15).map(s => s.name).join(', ');
              const totalCount = yearStudents.length;
              const moreText = totalCount > 15 ? ` and ${totalCount - 15} more` : '';
              return `YEAR ${year}: ${studentNames}${moreText} (${totalCount} students)`;
            });
          } else {
            // No students found in students table
            dept.studentList = [];
            console.log(`⚠️ No students found for department ${row.name} (ID: ${row.id})`);
          }
        } catch (studentErr) {
          console.error(`❌ Error fetching students for department ${row.id} (${row.name}):`, studentErr.message);
          console.error('Error details:', studentErr);
          dept.studentList = [];
        }

        return dept;
      }));
    } catch (err) {
      console.error('Error fetching departments:', err);
      departments = [];
    }
    
    // Get features - try homepage_features, fallback to features
    let features = [];
    try {
      try {
        const [featRows] = await pool.query(
          `SELECT id, icon, title, description, bg_gradient, link_url, display_order
           FROM homepage_features WHERE is_active = 1 ORDER BY display_order ASC`
        );
        features = featRows;
      } catch (err) {
        // If homepage_features doesn't exist, try features table
        if (err.code === 'ER_NO_SUCH_TABLE') {
          try {
            const [featRows] = await pool.query(
              `SELECT id, icon, title, description, bg_gradient as bg, link_url as link
               FROM features ORDER BY id ASC LIMIT 10`
            );
            features = featRows;
          } catch (err2) {
            // If features table also doesn't exist, just use empty array
            if (err2.code === 'ER_NO_SUCH_TABLE') {
              console.log('Features table does not exist, using empty array');
              features = [];
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }
      
      features = features.map(row => ({
        id: row.id,
        icon: row.icon || '✨',
        title: row.title,
        description: row.description,
        bg: row.bg_gradient || row.bg || '#667eea',
        link: row.link_url || row.link || ''
      }));
    } catch (err) {
      console.error('Error fetching features:', err);
      features = [];
    }
    
    // Get events - try homepage_events, fallback to events
    let events = [];
    try {
      try {
        const [eventRows] = await pool.query(
          `SELECT id, title, date, location, description, image_url, link_url, display_order
           FROM homepage_events WHERE is_active = 1 ORDER BY date ASC LIMIT 10`
        );
        events = eventRows;
      } catch (err) {
        const [eventRows] = await pool.query(
          `SELECT id,
                  title,
                  event_date AS date,
                  location,
                  description,
                  NULL       AS image_url,
                  NULL       AS link_url
           FROM events ORDER BY event_date ASC LIMIT 10`
        );
        events = eventRows;
      }
      
      // Parse events
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      events = events.map(row => {
        try {
          const eventDate = new Date(row.date);
          const formattedDate = `${eventDate.getDate()} ${months[eventDate.getMonth()]}`;
          return {
            id: row.id,
            date: formattedDate,
            title: row.title,
            time: '09:00 AM',
            location: row.location || '',
            description: row.description,
            image_url: row.image_url,
            link_url: row.link_url
          };
        } catch (e) {
          return {
            id: row.id,
            date: row.date || '',
            title: row.title,
            time: '09:00 AM',
            location: row.location || '',
            description: row.description,
            image_url: row.image_url,
            link_url: row.link_url
          };
        }
      });
    } catch (err) {
      console.error('Error fetching events:', err);
      events = [];
    }
    
    res.json({
      success: true,
      data: {
        departments: departments,
        features: features,
        events: events
      }
    });
    
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage data',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    res.json({
      success: true,
      message: 'Server is running and database is connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
  res.status(500).json({ 
    success: false, 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GPL Lohaghat Smart Campus Portal API',
    version: '1.0.0',
    endpoints: {
      gallery: '/api/gallery',
      homepage: {
        all: '/api/homepage/all',
        departments: '/api/homepage/departments',
        features: '/api/homepage/features',
        events: '/api/homepage/events'
      },
      health: '/api/health'
    }
  });
});

// Start server (ONLY ONCE - at the end)
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   GET  /api/gallery - Get all images`);
  console.log(`   GET  /api/gallery/full - Get full details`);
  console.log(`   POST /api/gallery - Add new image`);
  console.log(`   PUT  /api/gallery/:id - Update image`);
  console.log(`   DELETE /api/gallery/:id - Delete image`);
  console.log(`   GET  /api/homepage/all - Get all homepage data`);
  console.log(`   GET  /api/homepage/departments - Get departments`);
  console.log(`   GET  /api/homepage/features - Get features`);
  console.log(`   GET  /api/homepage/events - Get events`);
  console.log(`   POST /api/auth/register - Register user`);
  console.log(`   POST /api/auth/login - Login user`);
  console.log(`   POST /api/auth/parent-login - Parent login`);
  console.log(`   GET  /api/health - Health check`);
});

// Handle server errors (EADDRINUSE)
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use!`);
    console.error(`\n💡 Solution:`);
    console.error(`   1. Close the existing server process`);
    console.error(`   2. Or kill the process: Get-NetTCPConnection -LocalPort ${PORT} | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }`);
    console.error(`   3. Then restart the server\n`);
    process.exit(1);
  } else {
    console.error('\n❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Shutting down server...');
  pool.end(() => {
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});

module.exports = app;
