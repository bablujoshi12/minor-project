const pool = require('../config/database');

// Get all public notes (for homepage)
const getPublicNotes = async (req, res) => {
  try {
    // Check if notes_board table exists, if not return empty array
    const [notes] = await pool.execute(
      `SELECT id, title, message, priority, created_at, updated_at
       FROM notes_board 
       WHERE status = 'active' 
       ORDER BY priority DESC, created_at DESC 
       LIMIT 10`
    );
    res.json({ success: true, data: notes || [] });
  } catch (error) {
    // If table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      console.log('Notes board table does not exist, returning empty array');
      return res.json({ success: true, data: [] });
    }
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, message: 'Error fetching notes', error: error.message });
  }
};

// Get all notes (for admin)
const getAllNotes = async (req, res) => {
  try {
    const [notes] = await pool.query(
      `SELECT id, title, message, priority, status, created_at, updated_at
       FROM notes_board 
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Error fetching all notes:', error);
    res.status(500).json({ success: false, message: 'Error fetching notes', error: error.message });
  }
};

// Create new note (admin only)
const createNote = async (req, res) => {
  try {
    const { title, message, priority = 'normal' } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO notes_board (title, message, priority, status, created_at, updated_at)
       VALUES (?, ?, ?, 'active', NOW(), NOW())`,
      [title, message, priority]
    );

    res.json({
      success: true,
      message: 'Note created successfully',
      data: { id: result.insertId, title, message, priority }
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ success: false, message: 'Error creating note', error: error.message });
  }
};

// Update note (admin only)
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, priority, status } = req.body;

    const updates = [];
    const values = [];

    if (title) { updates.push('title = ?'); values.push(title); }
    if (message) { updates.push('message = ?'); values.push(message); }
    if (priority) { updates.push('priority = ?'); values.push(priority); }
    if (status) { updates.push('status = ?'); values.push(status); }
    
    updates.push('updated_at = NOW()');
    values.push(id);

    await pool.execute(
      `UPDATE notes_board SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ success: false, message: 'Error updating note', error: error.message });
  }
};

// Delete note (admin only)
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM notes_board WHERE id = ?', [id]);

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ success: false, message: 'Error deleting note', error: error.message });
  }
};

module.exports = {
  getPublicNotes,
  getAllNotes,
  createNote,
  updateNote,
  deleteNote
};

