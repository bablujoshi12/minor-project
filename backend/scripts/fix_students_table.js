const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function fixStudentsTable() {
  try {
    console.log('🔧 Fixing students table structure...\n');

    // Get current columns
    const [currentColumns] = await pool.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'students' 
       ORDER BY ORDINAL_POSITION`
    );

    console.log('📋 Current columns:', currentColumns.map(c => c.COLUMN_NAME).join(', '));

    const existingColumns = currentColumns.map(c => c.COLUMN_NAME);

    // Columns to add
    const columnsToAdd = [
      { name: 'email', def: 'VARCHAR(255) NULL AFTER roll_no' },
      { name: 'password', def: 'VARCHAR(255) NULL AFTER email' },
      { name: 'branch_id', def: 'INT(11) NULL AFTER password' },
      { name: 'section', def: 'VARCHAR(10) NULL' },
      { name: 'phone', def: 'VARCHAR(20) NULL' },
      { name: 'mother_name', def: 'VARCHAR(255) NULL' },
      { name: 'parent_email', def: 'VARCHAR(255) NULL' },
      { name: 'parent_phone', def: 'VARCHAR(20) NULL' },
      { name: 'blood_group', def: 'VARCHAR(10) NULL' },
      { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    // Add missing columns
    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        try {
          await pool.execute(`ALTER TABLE students ADD COLUMN ${col.name} ${col.def}`);
          console.log(`✅ Added column: ${col.name}`);
        } catch (err) {
          if (err.code === 'ER_DUP_FIELDNAME') {
            console.log(`ℹ️  Column ${col.name} already exists`);
          } else {
            console.error(`❌ Error adding column ${col.name}:`, err.message);
          }
        }
      } else {
        console.log(`✓ Column ${col.name} already exists`);
      }
    }

    // Add indexes
    const indexes = [
      { name: 'idx_students_email', columns: ['email'] },
      { name: 'idx_students_branch', columns: ['branch_id'] },
      { name: 'idx_students_parent_email', columns: ['parent_email'] }
    ];

    for (const idx of indexes) {
      try {
        await pool.execute(`CREATE INDEX ${idx.name} ON students (${idx.columns.join(', ')})`);
        console.log(`✅ Created index: ${idx.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log(`ℹ️  Index ${idx.name} already exists`);
        } else {
          console.error(`❌ Error creating index ${idx.name}:`, err.message);
        }
      }
    }

    // Map department_id to branch_id if needed
    const [hasDepartmentId] = await pool.execute(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'students' 
       AND COLUMN_NAME = 'department_id'`
    );

    if (hasDepartmentId[0].count > 0) {
      // Try to map departments to branches
      const [studentsToUpdate] = await pool.execute(
        `SELECT s.id, s.department_id, d.name as dept_name 
         FROM students s 
         LEFT JOIN departments d ON d.id = s.department_id 
         WHERE s.branch_id IS NULL AND s.department_id IS NOT NULL 
         LIMIT 10`
      );

      if (studentsToUpdate.length > 0) {
        console.log('\n🔄 Mapping department_id to branch_id...');
        
        // Simple mapping: try to find branch by department name
        for (const student of studentsToUpdate) {
          const [branches] = await pool.execute(
            `SELECT id FROM branches 
             WHERE name LIKE ? OR code LIKE ? 
             LIMIT 1`,
            [`%${student.dept_name || ''}%`, `%${student.dept_name || ''}%`]
          );
          
          if (branches.length > 0) {
            await pool.execute(
              `UPDATE students SET branch_id = ? WHERE id = ?`,
              [branches[0].id, student.id]
            );
            console.log(`✓ Mapped student ${student.id} to branch ${branches[0].id}`);
          }
        }
      }
    }

    // Final check
    const [finalColumns] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'students' 
       ORDER BY ORDINAL_POSITION`
    );

    console.log('\n✅ Students table structure updated!');
    console.log('📋 Final columns:', finalColumns.map(c => c.COLUMN_NAME).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing students table:', error);
    process.exit(1);
  }
}

fixStudentsTable();

