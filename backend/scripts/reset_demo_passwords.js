const bcrypt = require('bcryptjs');
const pool = require('../config/database');

/**
 * This script will update demo admin/teacher passwords in the smart_campus DB
 * so that they match the plaintext passwords you shared, using bcrypt hashes.
 *
 * Run from backend folder:
 *   node scripts/reset_demo_passwords.js
 */

const DEMO_USERS = [
  // Admin
  { table: 'admins', email: 'vlogsnature05@gmail.com', password: 'root23371826' },

  // Teachers
  { table: 'teachers', email: 'it018@gmail.com', password: 'it23371826' },
  { table: 'teachers', email: 'civil@gmail.com', password: 'civil23371826' },
  { table: 'teachers', email: 'electronics@gmail.com', password: 'electronics23371826' },
  { table: 'teachers', email: 'pharmacy@gmail.com', password: 'pharmacy23371826' },
  { table: 'teachers', email: 'mechanical@gmail.com', password: 'mechanical23371826' }
];

const run = async () => {
  try {
    console.log('🔐 Resetting demo passwords in database smart_campus...');

    for (const user of DEMO_USERS) {
      const hash = await bcrypt.hash(user.password, 10);
      const [result] = await pool.execute(
        `UPDATE ${user.table} SET password = ? WHERE email = ?`,
        [hash, user.email]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ Updated password for ${user.table}.${user.email}`);
      } else {
        console.log(`⚠️ User not found for ${user.table}.${user.email} (no row updated)`);
      }
    }

    console.log('✅ Done. Try logging in again with the same emails/passwords.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting demo passwords:', err);
    process.exit(1);
  }
};

run();


