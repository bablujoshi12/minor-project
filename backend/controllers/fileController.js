const path = require('path');
const fs = require('fs');
const pool = require('../config/database');

// Download assignment file
// Verifies user has access and serves the file
const downloadAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get assignment details
    const [assignments] = await pool.execute(
      `SELECT a.*, s.branch_id as student_branch_id 
       FROM assignments a
       LEFT JOIN students s ON a.student_id = s.id
       WHERE a.id = ?`,
      [assignmentId]
    );

    if (assignments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const assignment = assignments[0];
    const fileUrl = assignment.file_url || assignment.file_path;

    if (!fileUrl) {
      return res.status(404).json({ success: false, message: 'File not found for this assignment' });
    }

    // Verify access based on role
    if (userRole === 'student') {
      const [students] = await pool.execute('SELECT branch_id FROM students WHERE id = ?', [userId]);
      if (students.length === 0 || students[0].branch_id !== assignment.branch_id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (userRole === 'teacher') {
      const [teachers] = await pool.execute('SELECT branch_id FROM teachers WHERE id = ?', [userId]);
      if (teachers.length === 0 || teachers[0].branch_id !== assignment.branch_id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (userRole === 'parent') {
      // Parents can access if it's their child's assignment
      const [relations] = await pool.execute(
        'SELECT * FROM parents WHERE id = ? AND student_id = ?',
        [userId, assignment.student_id]
      );
      if (relations.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    // Extract filename from URL (e.g., /uploads/assignments/filename.pdf)
    const filename = path.basename(fileUrl);
    const filePath = path.join(__dirname, '..', fileUrl);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to download file', error: error.message });
  }
};

module.exports = {
  downloadAssignment
};

