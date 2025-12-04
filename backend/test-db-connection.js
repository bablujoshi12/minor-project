const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing MySQL Connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || 3306}`);
  console.log(`  User: ${process.env.DB_USER || 'root'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'smart_campus'}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : '(not set)'}\n`);

  // Test 1: Try root user
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    console.log('✅ Step 1: MySQL server connection successful!');
    
    // Test 2: Check if database exists
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [process.env.DB_NAME || 'smart_campus']);
    if (databases.length > 0) {
      console.log(`✅ Step 2: Database "${process.env.DB_NAME || 'smart_campus'}" exists!`);
    } else {
      console.log(`❌ Step 2: Database "${process.env.DB_NAME || 'smart_campus'}" does NOT exist!`);
      console.log('   💡 Please run: database/smart_campus.sql in MySQL');
    }
    
    // Test 3: Try to use database
    try {
      await connection.query(`USE ${process.env.DB_NAME || 'smart_campus'}`);
      console.log(`✅ Step 3: Successfully connected to database "${process.env.DB_NAME || 'smart_campus'}"!`);
      
      // Test 4: Check tables
      const [tables] = await connection.query('SHOW TABLES');
      console.log(`✅ Step 4: Found ${tables.length} tables in database`);
      
      await connection.end();
      console.log('\n🎉 All tests passed! Database connection is working correctly.');
    } catch (dbError) {
      console.log(`❌ Step 3: Cannot access database - ${dbError.message}`);
      await connection.end();
    }
    
  } catch (error) {
    console.log(`❌ Step 1: Connection failed - ${error.message}\n`);
    console.log('💡 Possible solutions:');
    console.log('   1. Check if MySQL service is running');
    console.log('   2. Verify root password in .env file');
    console.log('   3. Try connecting with MySQL Workbench or command line first');
    console.log('   4. If password is wrong, update backend/.env file with correct password');
    console.log('\n   To test MySQL password manually:');
    console.log('   mysql -u root -p');
    console.log('   (Then enter your password)');
  }
}

testConnection();

