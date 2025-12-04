// Setup Database Tables and Default Users
// Run this script after creating database: gpl_lohaghat_db

const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Read and execute complete_system_schema.sql
    const schemaPath = path.join(__dirname, '../../database/complete_system_schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      console.log('📄 Reading schema file...');
      let schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolons but keep CREATE TABLE statements intact
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`📝 Executing ${statements.length} SQL statements...\n`);
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await pool.execute(statement);
          } catch (err) {
            if (!err.message.includes('already exists')) {
              console.log(`⚠️  Warning: ${err.message.substring(0, 100)}`);
            }
          }
        }
      }
      
      console.log('✅ Schema executed!\n');
    } else {
      console.log('⚠️  Schema file not found, creating tables manually...\n');
      
      // Create tables manually
      await createTables();
    }

    // Setup default users
    await setupDefaultUsers();

    console.log('\n✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

async function createTables() {
  console.log('Creating tables...\n');

  // Admins table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT(11) NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Branches table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS branches (
      id INT(11) NOT NULL AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Insert branches
  await pool.execute(`
    INSERT IGNORE INTO branches (name, code, description) VALUES
    ('Information Technology', 'IT', 'IT Department'),
    ('Civil Engineering', 'CIVIL', 'Civil Engineering Department'),
    ('Electronics Engineering', 'ELECTRONICS', 'Electronics Engineering Department'),
    ('Pharmacy', 'PHARMACY', 'Pharmacy Department'),
    ('Mechanical Engineering', 'MECHANICAL', 'Mechanical Engineering Department')
  `);

  // Teachers table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INT(11) NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      branch_id INT(11) NOT NULL,
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      INDEX idx_email (email),
      INDEX idx_branch (branch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Students table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id INT(11) NOT NULL AUTO_INCREMENT,
      roll_no VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255),
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      branch_id INT(11) NOT NULL,
      year INT(11) DEFAULT 1,
      section VARCHAR(10),
      dob DATE,
      phone VARCHAR(20),
      father_name VARCHAR(255),
      mother_name VARCHAR(255),
      parent_email VARCHAR(255),
      parent_name VARCHAR(255),
      parent_phone VARCHAR(20),
      blood_group VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      INDEX idx_roll_no (roll_no),
      INDEX idx_email (email),
      INDEX idx_branch (branch_id),
      INDEX idx_parent_email (parent_email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Parents table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS parents (
      id INT(11) NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      student_id INT(11) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      INDEX idx_email (email),
      INDEX idx_student (student_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('✅ Tables created!\n');
}

async function setupDefaultUsers() {
  console.log('👤 Setting up default users...\n');

  // Get branch IDs
  const [branches] = await pool.query('SELECT id, code FROM branches');
  const branchMap = {};
  branches.forEach(b => { branchMap[b.code] = b.id; });

  // Setup Admin
  const adminPassword = await bcrypt.hash('root23371826', 10);
  await pool.execute(
    'INSERT INTO admins (email, password, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = ?',
    ['vlogsnature05@gmail.com', adminPassword, 'Root Admin', adminPassword]
  );
  console.log('✅ Admin created: vlogsnature05@gmail.com / root23371826');

  // Setup Teachers
  const teachers = [
    { email: 'it018@gmail.com', password: 'it23371826', name: 'IT Teacher', branch: 'IT' },
    { email: 'civil@gmail.com', password: 'civil23371826', name: 'Civil Teacher', branch: 'CIVIL' },
    { email: 'electronics@gmail.com', password: 'electronics23371826', name: 'Electronics Teacher', branch: 'ELECTRONICS' },
    { email: 'pharmacy@gmail.com', password: 'pharmacy23371826', name: 'Pharmacy Teacher', branch: 'PHARMACY' },
    { email: 'mechanical@gmail.com', password: 'mechanical23371826', name: 'Mechanical Teacher', branch: 'MECHANICAL' }
  ];

  for (const teacher of teachers) {
    if (!branchMap[teacher.branch]) {
      console.log(`⚠️  Branch ${teacher.branch} not found, skipping teacher`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(teacher.password, 10);
    await pool.execute(
      'INSERT INTO teachers (email, password, name, branch_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?',
      [teacher.email, hashedPassword, teacher.name, branchMap[teacher.branch], hashedPassword]
    );
    console.log(`✅ Teacher created: ${teacher.email} / ${teacher.password}`);
  }

  console.log('\n✅ All default users created!');
}

// Run setup
setupDatabase();



