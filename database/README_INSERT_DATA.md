# How to Insert Sample Attendance and Marks Data

## ⚠️ Important Steps:

### Step 1: Select Database
Before running the script, make sure to select your database:

**Option A: In MySQL Workbench**
1. Double-click your database name in the SCHEMAS list (left sidebar)
   - Database name: `smart_campus`
2. The database name will be **bold** when selected

**Option B: In MySQL Command Line**
```sql
USE smart_campus;
```

**Option C: Run script with database specified**
```bash
mysql -u root -p smart_campus < database/insert_sample_attendance_marks.sql
```

### Step 2: Verify Prerequisites
Make sure you have:
- ✅ Students table with students data
- ✅ Teachers table with teachers data
- ✅ Branches table with branches data
- ✅ Attendance table exists
- ✅ Marks table exists

### Step 3: Run the Script

**In MySQL Workbench:**
1. Open `database/insert_sample_attendance_marks.sql`
2. Make sure database is selected (double-click in SCHEMAS)
3. Click "Execute" or press `Ctrl+Enter`

**In MySQL Command Line:**
```bash
mysql -u root -p
```
Then:
```sql
USE smart_campus;
source database/insert_sample_attendance_marks.sql;
```

### Step 4: Verify Data
After running, check if data was inserted:

```sql
-- Check attendance count
SELECT COUNT(*) as total_attendance_records FROM attendance;

-- Check marks count
SELECT COUNT(*) as total_marks_records FROM marks;

-- Check attendance percentage (should be ~80%)
SELECT 
    s.id,
    s.name,
    s.roll_no,
    COUNT(a.id) as total_days,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
    ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as attendance_percentage
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.name, s.roll_no
LIMIT 10;

-- Check marks (should be 70-95)
SELECT 
    s.id,
    s.name,
    COUNT(m.id) as total_marks,
    AVG(m.marks_obtained) as avg_marks,
    MIN(m.marks_obtained) as min_marks,
    MAX(m.marks_obtained) as max_marks
FROM students s
LEFT JOIN marks m ON s.id = m.student_id
GROUP BY s.id, s.name
LIMIT 10;
```

## 🔧 Troubleshooting

### Error: "No database selected"
**Solution:**
1. Double-click your database name in MySQL Workbench SCHEMAS panel
2. Or add `USE gpl_lohaghat_db;` at the top of the script
3. Or run: `mysql -u root -p gpl_lohaghat_db < database/insert_sample_attendance_marks.sql`

### Error: "Table doesn't exist"
**Solution:**
- Run `database/complete_system_schema.sql` first to create all tables

### Error: "No students found"
**Solution:**
- Make sure students are registered/inserted in the students table first

### Error: "No teachers found for branch"
**Solution:**
- Make sure teachers are inserted and linked to branches
- Run `backend/scripts/setup_default_users.js` or insert teachers manually

## 📊 Expected Results

After running successfully:
- ✅ All students should have 30 attendance records (last 30 days)
- ✅ Attendance percentage should be exactly 80% (24 present, 6 absent)
- ✅ Each student should have 6-8 marks
- ✅ All marks should be between 70-95

