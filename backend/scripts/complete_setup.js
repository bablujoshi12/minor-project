// Complete Setup Script - Creates tables and default users
// Run: node backend/scripts/complete_setup.js

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function createTables() {
  console.log('📊 Creating database tables...\n');

  try {
    // Branches
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

    await pool.execute(`
      INSERT IGNORE INTO branches (name, code, description) VALUES
      ('Information Technology', 'IT', 'IT Department'),
      ('Civil Engineering', 'CIVIL', 'Civil Engineering Department'),
      ('Electronics Engineering', 'ELECTRONICS', 'Electronics Engineering Department'),
      ('Pharmacy', 'PHARMACY', 'Pharmacy Department'),
      ('Mechanical Engineering', 'MECHANICAL', 'Mechanical Engineering Department')
    `);
    console.log('✅ Branches table created');

    // Admins
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
    console.log('✅ Admins table created');

    // Teachers
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
    console.log('✅ Teachers table created');

    // Students
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
    console.log('✅ Students table created');

    // Parents
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
    console.log('✅ Parents table created\n');
  } catch (error) {
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
}

async function setupDefaultUsers() {
  console.log('👤 Setting up default users...\n');

  // Get branches
  const [branches] = await pool.query('SELECT id, code FROM branches');
  const branchMap = {};
  branches.forEach(b => { branchMap[b.code] = b.id; });

  // Admin
  const adminPassword = await bcrypt.hash('root23371826', 10);
  await pool.execute(
    'INSERT INTO admins (email, password, name) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), name = VALUES(name)',
    ['vlogsnature05@gmail.com', adminPassword, 'Root Admin']
  );
  console.log('✅ Admin: vlogsnature05@gmail.com / root23371826');

  // Teachers
  const teachers = [
    { email: 'it018@gmail.com', password: 'it23371826', name: 'IT Teacher', branch: 'IT' },
    { email: 'civil@gmail.com', password: 'civil23371826', name: 'Civil Teacher', branch: 'CIVIL' },
    { email: 'electronics@gmail.com', password: 'electronics23371826', name: 'Electronics Teacher', branch: 'ELECTRONICS' },
    { email: 'pharmacy@gmail.com', password: 'pharmacy23371826', name: 'Pharmacy Teacher', branch: 'PHARMACY' },
    { email: 'mechanical@gmail.com', password: 'mechanical23371826', name: 'Mechanical Teacher', branch: 'MECHANICAL' }
  ];

  for (const teacher of teachers) {
    if (!branchMap[teacher.branch]) {
      console.log(`⚠️  Branch ${teacher.branch} not found`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(teacher.password, 10);
    await pool.execute(
      'INSERT INTO teachers (email, password, name, branch_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), name = VALUES(name)',
      [teacher.email, hashedPassword, teacher.name, branchMap[teacher.branch]]
    );
    console.log(`✅ Teacher: ${teacher.email} / ${teacher.password}`);
  }
}

async function main() {
  try {
    console.log('🚀 Starting complete setup...\n');
    
    await createTables();
    await setupDefaultUsers();
    
    console.log('\n✨ Setup completed successfully!');
    console.log('\n📝 Default Credentials:');
    console.log('   Admin: vlogsnature05@gmail.com / root23371826');
    console.log('   IT Teacher: it018@gmail.com / it23371826');
    console.log('   Civil Teacher: civil@gmail.com / civil23371826');
    console.log('   Electronics Teacher: electronics@gmail.com / electronics23371826');
    console.log('   Pharmacy Teacher: pharmacy@gmail.com / pharmacy23371826');
    console.log('   Mechanical Teacher: mechanical@gmail.com / mechanical23371826');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

