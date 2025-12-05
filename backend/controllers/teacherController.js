const pool = require('../config/database');

// Get Student List (branch + year + semester filters)
// Teacher can ONLY see students from their own branch
const getStudentList = async (req, res) => {
  try {
    const { year, semester } = req.query;
    const teacherId = req.user.userId;

    // Get teacher's branch_id
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const teacherBranchId = teachers[0].branch_id;

    if (!teacherBranchId) {
      return res.status(403).json({ success: false, message: 'Teacher branch not assigned. Please contact admin.' });
    }

    // Get branch code from branches table for display
    const [branchInfo] = await pool.execute('SELECT code, name FROM branches WHERE id = ?', [teacherBranchId]);
    const branchCode = branchInfo[0]?.code || '';
    const branchName = branchInfo[0]?.name || '';

    // ALWAYS filter by teacher's branch_id - no override allowed
    let query = `
      SELECT s.id, s.roll_no, s.name, s.section, s.year, s.semester, s.email, s.phone,
             s.branch_id, b.code as branch_code, b.name as branch_name
      FROM students s
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE s.branch_id = ?
    `;
    const params = [teacherBranchId]; // ALWAYS use teacher's branch_id

    // Optional filters
    if (year) {
      query += ' AND s.year = ?';
      params.push(year);
    }
    if (semester) {
      query += ' AND s.semester = ?';
      params.push(semester);
    }

    query += ' ORDER BY s.roll_no ASC';

    const [students] = await pool.execute(query, params);

    console.log(`✅ Teacher ${teacherId} (Branch: ${branchCode}) viewing ${students.length} students`);

    // Format students data to include branch info
    const formattedStudents = students.map(s => ({
      id: s.id,
      roll_no: s.roll_no,
      name: s.name,
      section: s.section,
      branch: s.branch_code || s.branch_id,
      branch_name: s.branch_name || '',
      branch_id: s.branch_id,
      year: s.year,
      semester: s.semester,
      email: s.email,
      phone: s.phone
    }));

    res.json({ 
      success: true, 
      data: formattedStudents,
      teacher_branch: {
        id: teacherBranchId,
        code: branchCode,
        name: branchName
      }
    });
  } catch (error) {
    console.error('Get student list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

// Get Assignments (with filters)
// Teacher can ONLY see assignments from their own branch students
const getAssignments = async (req, res) => {
  try {
    const { year, status, student_id } = req.query; // Removed branch filter
    const teacherId = req.user.userId;

    // Get teacher's branch_id
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const teacherBranchId = teachers[0].branch_id;

    if (!teacherBranchId) {
      return res.status(403).json({ success: false, message: 'Teacher branch not assigned. Please contact admin.' });
    }

    // ALWAYS filter by teacher's branch - check both assignment.branch_id and student.branch_id
    let query = `
      SELECT a.*, s.name as student_name, s.roll_no, s.year, b.code as branch_code, b.name as branch_name
      FROM assignments a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE (a.branch_id = ? OR s.branch_id = ?)
    `;
    let params = [teacherBranchId, teacherBranchId]; // ALWAYS use teacher's branch_id

    if (year) {
      query += ' AND s.year = ?';
      params.push(year);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (student_id) {
      // Verify student belongs to teacher's branch
      query += ' AND a.student_id = ? AND s.branch_id = ?';
      params.push(student_id, teacherBranchId);
    }

    query += ' ORDER BY a.created_at DESC';

    const [assignments] = await pool.execute(query, params);

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    // If assignments table doesn't exist yet, return empty list instead of 500
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
};

// Get Assignment Submissions (for teacher-assigned assignments)
const getAssignmentSubmissions = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { assignment_id } = req.query;

    if (!assignment_id) {
      return res.status(400).json({ success: false, message: 'Assignment ID is required' });
    }

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const teacherBranchId = teachers[0].branch_id;

    // Verify assignment belongs to teacher
    const [assignments] = await pool.execute(
      'SELECT * FROM assignments WHERE id = ? AND teacher_id = ? AND branch_id = ?',
      [assignment_id, teacherId, teacherBranchId]
    );

    if (assignments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found or access denied' });
    }

    // Get all students in the branch
    const [allStudents] = await pool.execute(
      'SELECT id, name, roll_no, year FROM students WHERE branch_id = ?',
      [teacherBranchId]
    );

    // Get submissions
    const [submissions] = await pool.execute(
      `SELECT asub.*, s.name as student_name, s.roll_no, s.year
       FROM assignment_submissions asub
       JOIN students s ON asub.student_id = s.id
       WHERE asub.assignment_id = ?
       ORDER BY asub.submission_date DESC`,
      [assignment_id]
    );

    // Create a map of submitted students
    const submittedMap = new Map();
    submissions.forEach(sub => {
      submittedMap.set(sub.student_id, sub);
    });

    // Combine all students with their submission status
    const result = allStudents.map(student => {
      const submission = submittedMap.get(student.id);
      return {
        student_id: student.id,
        student_name: student.name,
        roll_no: student.roll_no,
        year: student.year,
        is_submitted: !!submission,
        submission_date: submission?.submission_date || null,
        file_url: submission?.file_url || null,
        status: submission?.status || 'pending',
        marks: submission?.marks || null,
        feedback: submission?.feedback || null
      };
    });

    res.json({ 
      success: true, 
      data: {
        assignment: assignments[0],
        submissions: result,
        total_students: allStudents.length,
        submitted_count: submissions.length,
        pending_count: allStudents.length - submissions.length
      }
    });
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
};

// Get All Assignments with Submission Counts
const getAssignmentsWithCounts = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const teacherBranchId = teachers[0].branch_id;

    // Get all assignments created by this teacher (branch-wide, student_id IS NULL)
    const [assignments] = await pool.execute(
      `SELECT a.*, 
       (SELECT COUNT(*) FROM students WHERE branch_id = ?) as total_students,
       (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submitted_count
       FROM assignments a
       WHERE a.teacher_id = ? AND a.branch_id = ? AND a.student_id IS NULL
       ORDER BY a.created_at DESC`,
      [teacherBranchId, teacherId, teacherBranchId]
    );

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Get assignments with counts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
};

// Check/Update Assignment (marks and feedback)
const updateAssignment = async (req, res) => {
  try {
    const { assignment_id, marks, feedback, status, student_id } = req.body;

    // If student_id is provided, update assignment_submissions table
    if (student_id && assignment_id) {
      await pool.execute(
        `UPDATE assignment_submissions 
         SET marks = ?, feedback = ?, status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE assignment_id = ? AND student_id = ?`,
        [marks || null, feedback || null, status || 'checked', assignment_id, student_id]
      );
      return res.json({ success: true, message: 'Assignment submission updated successfully' });
    }

    // Otherwise, update the assignment itself (for student-submitted assignments)
    await pool.execute(
      `UPDATE assignments 
       SET marks = ?, feedback = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [marks || null, feedback || null, status || 'checked', assignment_id]
    );

    res.json({ success: true, message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update assignment', error: error.message });
  }
};

// Get Attendance Graph Data
// Teacher can ONLY see attendance from their own branch students
const getAttendanceGraph = async (req, res) => {
  try {
    const { year, date } = req.query; // Removed branch filter
    const teacherId = req.user.userId;

    // Get teacher's branch_id
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const teacherBranchId = teachers[0].branch_id;

    if (!teacherBranchId) {
      return res.status(403).json({ success: false, message: 'Teacher branch not assigned. Please contact admin.' });
    }

    // ALWAYS use teacher's branch_id - no override allowed

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get total students in branch/year
    let studentQuery = `
      SELECT COUNT(*) as total FROM students WHERE branch_id = ?
    `;
    let params = [teacherBranchId];

    if (year) {
      studentQuery += ' AND year = ?';
      params.push(year);
    }

    const [totalResult] = await pool.execute(studentQuery, params);
    const totalStudents = totalResult[0].total || 0;

    // Get attendance for the date
    let attendanceQuery = `
      SELECT 
        COUNT(DISTINCT a.student_id) as present_count,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count_detailed
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE DATE(a.date) = ? AND s.branch_id = ?
    `;
    let attendanceParams = [targetDate, teacherBranchId];

    if (year) {
      attendanceQuery += ' AND s.year = ?';
      attendanceParams.push(year);
    }

    const [attendance] = await pool.execute(attendanceQuery, attendanceParams);

    // Get daily attendance for last 30 days
    const [dailyData] = await pool.execute(
      `SELECT 
         DATE(a.date) as date,
         COUNT(DISTINCT a.student_id) as present_students
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE a.status = 'present' 
         AND s.branch_id = ?
         AND a.date >= DATE_SUB(?, INTERVAL 30 DAY)
       GROUP BY DATE(a.date)
       ORDER BY date ASC`,
      [teacherBranchId, targetDate]
    );

    const presentCount = attendance[0]?.present_count_detailed || 0;
    const absentCount = totalStudents - presentCount;

    res.json({
      success: true,
      data: {
        date: targetDate,
        totalStudents,
        presentStudents: presentCount,
        absentStudents: absentCount,
        presentPercentage: totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : 0,
        dailyData: dailyData
      }
    });
  } catch (error) {
    console.error('Attendance graph error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance graph', error: error.message });
  }
};

// Send Message to Student/Parent
// Teacher can only send messages to students from their own branch
const sendMessage = async (req, res) => {
  try {
    const { to_id, to_role, subject, message } = req.body;
    const fromId = req.user.userId;
    const fromRole = req.user.role;

    if (!to_id || !to_role || !message) {
      return res.status(400).json({ success: false, message: 'to_id, to_role, and message are required' });
    }

    // If sending to a student, verify they belong to teacher's branch
    if (to_role === 'student') {
      const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [fromId]);
      if (teachers.length > 0 && teachers[0].branch_id) {
        const teacherBranchId = teachers[0].branch_id;
        const [students] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [to_id]);
        if (students.length > 0) {
          const studentBranchId = students[0].branch_id;
          if (studentBranchId !== teacherBranchId) {
            return res.status(403).json({ 
              success: false, 
              message: 'Access denied. You can only send messages to students from your own branch.' 
            });
          }
        }
      }
    }

    await pool.execute(
      `INSERT INTO messages (from_id, from_role, to_id, to_role, subject, message) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fromId, fromRole, to_id, to_role, subject || '', message]
    );

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// Get Messages
const getMessages = async (req, res) => {
  try {
    const teacherId = req.user.userId;

    const [messages] = await pool.execute(
      `SELECT m.*, u.email as from_email 
       FROM messages m
       JOIN users u ON m.from_id = u.id
       WHERE m.to_id = (SELECT id FROM teachers WHERE user_id = ?)
       ORDER BY m.created_at DESC`,
      [teacherId]
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// Send Notice
const sendNotice = async (req, res) => {
  try {
    const { title, message, recipient_type } = req.body;
    const teacherId = req.user.userId;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    const branchId = teachers[0]?.branch_id || null;

    const [result] = await pool.execute(
      `INSERT INTO notices (title, message, sender_type, sender_id, recipient_type, branch_id, created_at) 
       VALUES (?, ?, 'teacher', ?, ?, ?, NOW())`,
      [title, message, teacherId, recipient_type || 'student', branchId]
    );

    res.json({ success: true, message: 'Notice sent successfully', data: { noticeId: result.insertId } });
  } catch (error) {
    console.error('Send notice error:', error);
    res.status(500).json({ success: false, message: 'Failed to send notice' });
  }
};

// Get Notices
const getNotices = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const [notices] = await pool.execute(
      `SELECT n.*, t.name as sender_name
       FROM notices n
       LEFT JOIN teachers t ON n.sender_id = t.id AND n.sender_type = 'teacher'
       WHERE (n.sender_id = ? AND n.sender_type = 'teacher')
       ORDER BY n.created_at DESC`,
      [teacherId]
    );
    res.json({ success: true, data: notices });
  } catch (error) {
    console.error('Get notices error:', error);
    // If notices table doesn't exist, just return empty array rather than 500
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      return res.json({ success: true, data: [] });
    }
    res.status(500).json({ success: false, message: 'Failed to fetch notices' });
  }
};

// Create Assignment (POST)
const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, due_date } = req.body;
    const teacherId = req.user.userId;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const branchId = teachers[0].branch_id;

    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : null;

    const [result] = await pool.execute(
      `INSERT INTO assignments (title, description, file_url, teacher_id, branch_id, due_date, subject, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, description || '', fileUrl, teacherId, branchId, due_date || null, subject || null]
    );

    const assignmentId = result.insertId;

    // Create notice for all students in the branch about new assignment
    try {
      await pool.execute(
        `INSERT INTO notices (title, message, branch_id, created_by, created_by_role, created_at)
         VALUES (?, ?, ?, ?, 'teacher', NOW())`,
        [
          `New Assignment: ${title}`,
          `A new assignment "${title}" has been assigned. ${due_date ? `Due date: ${new Date(due_date).toLocaleDateString()}` : ''}${description ? `\n\n${description}` : ''}`,
          branchId,
          teacherId
        ]
      );
    } catch (noticeError) {
      console.warn('Failed to create notice for assignment:', noticeError.message);
      // Don't fail the assignment creation if notice fails
    }

    res.json({ success: true, message: 'Assignment created successfully', data: { id: assignmentId } });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create assignment' });
  }
};

// Insert Attendance (Single or Bulk)
const insertAttendance = async (req, res) => {
  try {
    const { student_id, date, status, remarks, students } = req.body; // students is array for bulk insert
    const teacherId = req.user.userId;

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const branchId = teachers[0].branch_id;

    if (!branchId) {
      return res.status(403).json({ success: false, message: 'Teacher branch not assigned. Please contact admin.' });
    }

    // Bulk insert
    if (students && Array.isArray(students) && students.length > 0) {
      const attendanceData = [];
      for (const student of students) {
        if (student.student_id && student.date && student.status) {
          // Get student's branch_id and verify it matches teacher's branch
          const [studentData] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [student.student_id]);
          if (studentData.length === 0) continue; // Skip if student not found
          const studentBranchId = studentData[0]?.branch_id;
          
          // Verify student belongs to teacher's branch
          if (studentBranchId !== branchId) {
            console.warn(`⚠️ Teacher ${teacherId} tried to add attendance for student ${student.student_id} from different branch`);
            continue; // Skip students from other branches
          }
          
          attendanceData.push([
            student.student_id,
            student.date,
            student.status,
            studentBranchId,
            teacherId,
            student.remarks || null
          ]);
        }
      }

      if (attendanceData.length > 0) {
        // Build dynamic VALUES clause for bulk insert
        const placeholders = attendanceData.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const values = attendanceData.flat();
        await pool.execute(
          `INSERT INTO attendance (student_id, date, status, branch_id, teacher_id, remarks) 
           VALUES ${placeholders} 
           ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), teacher_id = VALUES(teacher_id)`,
          values
        );
        return res.json({ success: true, message: `Attendance recorded for ${attendanceData.length} students` });
      }
    }

    // Single insert
    if (student_id && date && status) {
      // Get student's branch_id and verify it matches teacher's branch
      const [studentData] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [student_id]);
      if (studentData.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      const studentBranchId = studentData[0]?.branch_id;
      
      // Verify student belongs to teacher's branch
      if (studentBranchId !== branchId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You can only add attendance for students from your own branch.' 
        });
      }

      await pool.execute(
        `INSERT INTO attendance (student_id, date, status, branch_id, teacher_id, remarks) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), teacher_id = VALUES(teacher_id)`,
        [student_id, date, status, studentBranchId, teacherId, remarks || null]
      );

      return res.json({ success: true, message: 'Attendance recorded successfully' });
    }

    return res.status(400).json({ success: false, message: 'Invalid data. Provide student_id, date, status or students array' });
  } catch (error) {
    console.error('Insert attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to insert attendance', error: error.message });
  }
};

// Insert Marks
const insertMarks = async (req, res) => {
  try {
    const { student_id, semester, subject, marks_obtained, max_marks = 100, exam_type, marks } = req.body; // marks is array for bulk insert
    const teacherId = req.user.userId;

    // Get teacher's branch
    const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    const branchId = teachers[0].branch_id;

    // Validate marks_obtained is not negative and not greater than max_marks
    if (marks_obtained !== undefined && marks_obtained !== null) {
      if (marks_obtained < 0) {
        return res.status(400).json({ success: false, message: 'Marks obtained cannot be negative' });
      }
      if (marks_obtained > max_marks) {
        return res.status(400).json({ success: false, message: 'Marks obtained cannot be greater than max marks' });
      }
    }

    // Bulk insert
    if (marks && Array.isArray(marks) && marks.length > 0) {
      let insertedCount = 0;
      let updatedCount = 0;
      
      for (const mark of marks) {
        if (mark.student_id && mark.semester && mark.subject && mark.marks_obtained !== undefined && mark.marks_obtained !== null) {
          // Validate marks
          if (mark.marks_obtained < 0) continue;
          if (mark.marks_obtained > (mark.max_marks || 100)) continue;

          // Get student's branch_id and verify it matches teacher's branch
          const [studentData] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [mark.student_id]);
          if (studentData.length === 0) continue; // Skip if student not found
          const studentBranchId = studentData[0]?.branch_id;
          
          // Verify student belongs to teacher's branch
          if (studentBranchId !== branchId) {
            console.warn(`⚠️ Teacher ${teacherId} tried to add marks for student ${mark.student_id} from different branch`);
            continue; // Skip students from other branches
          }

          // Check if marks entry already exists (same student, semester, subject, exam_type)
          const examTypeValue = mark.exam_type || 'Exam';
          const [existing] = await pool.execute(
            `SELECT id FROM marks 
             WHERE student_id = ? AND semester = ? AND subject = ? 
             AND COALESCE(exam_type, 'Exam') = ?`,
            [mark.student_id, mark.semester, mark.subject, examTypeValue]
          );

          if (existing.length > 0) {
            // Update existing entry
            await pool.execute(
              `UPDATE marks 
               SET marks_obtained = ?, max_marks = ?, teacher_id = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [mark.marks_obtained, mark.max_marks || 100, teacherId, existing[0].id]
            );
            updatedCount++;
          } else {
            // Insert new entry
            await pool.execute(
              `INSERT INTO marks (student_id, semester, subject, marks_obtained, max_marks, branch_id, teacher_id, exam_type) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [mark.student_id, mark.semester, mark.subject, mark.marks_obtained, mark.max_marks || 100, studentBranchId, teacherId, mark.exam_type || 'Exam']
            );
            insertedCount++;
          }
        }
      }

      if (insertedCount > 0 || updatedCount > 0) {
        return res.json({ 
          success: true, 
          message: `Marks processed: ${insertedCount} inserted, ${updatedCount} updated` 
        });
      } else {
        return res.status(400).json({ success: false, message: 'No valid marks data to insert' });
      }
    }

    // Single insert
    if (student_id && semester && subject && marks_obtained !== undefined && marks_obtained !== null) {
      // Validate student exists and belongs to teacher's branch
      const [studentData] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [student_id]);
      if (studentData.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      const studentBranchId = studentData[0]?.branch_id;
      
      // Verify student belongs to teacher's branch
      if (studentBranchId !== branchId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You can only add marks for students from your own branch.' 
        });
      }

      // Check if marks entry already exists
      const examTypeValue = exam_type || 'Exam';
      const [existing] = await pool.execute(
        `SELECT id FROM marks 
         WHERE student_id = ? AND semester = ? AND subject = ? 
         AND COALESCE(exam_type, 'Exam') = ?`,
        [student_id, semester, subject, examTypeValue]
      );

      if (existing.length > 0) {
        // Update existing entry
        await pool.execute(
          `UPDATE marks 
           SET marks_obtained = ?, max_marks = ?, teacher_id = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [marks_obtained, max_marks, teacherId, existing[0].id]
        );
        return res.json({ success: true, message: 'Marks updated successfully' });
      } else {
        // Insert new entry
        await pool.execute(
          `INSERT INTO marks (student_id, semester, subject, marks_obtained, max_marks, branch_id, teacher_id, exam_type) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [student_id, semester, subject, marks_obtained, max_marks, studentBranchId, teacherId, exam_type || 'Exam']
        );
        return res.json({ success: true, message: 'Marks recorded successfully' });
      }
    }

    return res.status(400).json({ success: false, message: 'Invalid data. Provide student_id, semester, subject, marks_obtained or marks array' });
  } catch (error) {
    console.error('Insert marks error:', error);
    // Handle table doesn't exist error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        success: false, 
        message: 'Marks table does not exist. Please check your database.',
        error: error.message 
      });
    }
    res.status(500).json({ success: false, message: 'Failed to insert marks', error: error.message });
  }
};

module.exports = {
  getStudentList,
  getAssignments,
  getAssignmentSubmissions,
  getAssignmentsWithCounts,
  updateAssignment,
  getAttendanceGraph,
  sendMessage,
  getMessages,
  sendNotice,
  getNotices,
  createAssignment,
  insertAttendance,
  insertMarks
};

