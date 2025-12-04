const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  // Default to the main Smart Campus database if DB_NAME is not set
  database: process.env.DB_NAME || 'smart_campus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection with retry logic
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    await connection.ping();
    connection.release();
    
    // Test database access
    const [rows] = await pool.query('SELECT DATABASE() as current_db');
    console.log(`📊 Connected to database: ${rows[0].current_db}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('💡 Please check:');
    console.error('   1. MySQL service is running');
    console.error('   2. Database credentials in .env file');
    console.error(`   3. Database "${process.env.DB_NAME || 'smart_campus'}" exists`);
    console.error(`   4. User "${process.env.DB_USER || 'root'}" has proper permissions`);
  }
};

testConnection();

module.exports = pool;

