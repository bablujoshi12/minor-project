// Script to setup default admin and teachers with hashed passwords
// Run: node backend/scripts/setup_default_users.js

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function setupDefaultUsers() {
  try {
    console.log('🚀 Setting up default users...\n');

    // Get branch IDs
    const [branches] = await pool.execute('SELECT id, code FROM branches');
    const branchMap = {};
    branches.forEach(b => {
      branchMap[b.code] = b.id;
    });

    // Admin
    const adminEmail = 'vlogsnature05@gmail.com';
    const adminPassword = 'root23371826';
    const adminHashed = await bcrypt.hash(adminPassword, 10);

    // Check if admin exists
    const [existingAdmin] = await pool.execute('SELECT id FROM admins WHERE email = ?', [adminEmail]);
    if (existingAdmin.length > 0) {
      await pool.execute('UPDATE admins SET password = ?, name = ? WHERE email = ?', 
        [adminHashed, 'Root Admin', adminEmail]);
      console.log('✅ Admin updated');
    } else {
      await pool.execute('INSERT INTO admins (email, password, name) VALUES (?, ?, ?)', 
        [adminEmail, adminHashed, 'Root Admin']);
      console.log('✅ Admin created');
    }

    // Teachers
    const teachers = [
      { email: 'it018@gmail.com', password: 'it23371826', name: 'IT Department Teacher', branch: 'IT' },
      { email: 'civil@gmail.com', password: 'civil23371826', name: 'Civil Department Teacher', branch: 'CIVIL' },
      { email: 'electronics@gmail.com', password: 'electronics23371826', name: 'Electronics Department Teacher', branch: 'ELECTRONICS' },
      { email: 'pharmacy@gmail.com', password: 'pharmacy23371826', name: 'Pharmacy Department Teacher', branch: 'PHARMACY' },
      { email: 'mechanical@gmail.com', password: 'mechanical23371826', name: 'Mechanical Department Teacher', branch: 'MECHANICAL' }
    ];

    for (const teacher of teachers) {
      const hashed = await bcrypt.hash(teacher.password, 10);
      const branchId = branchMap[teacher.branch];

      if (!branchId) {
        console.log(`⚠️ Branch ${teacher.branch} not found`);
        continue;
      }

      const [existing] = await pool.execute('SELECT id FROM teachers WHERE email = ?', [teacher.email]);
      if (existing.length > 0) {
        await pool.execute('UPDATE teachers SET password = ?, name = ?, branch_id = ? WHERE email = ?', 
          [hashed, teacher.name, branchId, teacher.email]);
        console.log(`✅ Teacher ${teacher.email} updated`);
      } else {
        await pool.execute('INSERT INTO teachers (email, password, name, branch_id, phone) VALUES (?, ?, ?, ?, ?)', 
          [teacher.email, hashed, teacher.name, branchId, '9876543210']);
        console.log(`✅ Teacher ${teacher.email} created`);
      }
    }

    console.log('\n✨ All default users setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up users:', error);
    process.exit(1);
  }
}

setupDefaultUsers();

