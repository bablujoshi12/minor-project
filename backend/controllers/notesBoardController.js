const pool = require('../config/database');

// Get all public notes (for homepage)
const getPublicNotes = async (req, res) => {
  try {
    // Use notices table instead of notes_board
    const [notes] = await pool.execute(
      `SELECT id, title, message, priority, created_at, updated_at
       FROM notices 
       WHERE recipient_type = 'all' 
       ORDER BY 
         CASE priority 
           WHEN 'high' THEN 3 
           WHEN 'medium' THEN 2 
           WHEN 'low' THEN 1 
         END DESC, 
         created_at DESC 
       LIMIT 10`
    );
    res.json({ success: true, data: notes || [] });
  } catch (error) {
    // If table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      console.log('Notices table does not exist, returning empty array');
      return res.json({ success: true, data: [] });
    }
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, message: 'Error fetching notes', error: error.message });
  }
};

// Get all notes (for admin) - using notices table
const getAllNotes = async (req, res) => {
  try {
    const [notes] = await pool.query(
      `SELECT 
        id, 
        title, 
        message, 
        priority, 
        sender_type,
        recipient_type,
        branch_id,
        created_at, 
        updated_at
       FROM notices 
       ORDER BY created_at DESC`
    );
    
    // Map notices to notes format (add status field based on recipient_type)
    const formattedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      message: note.message,
      priority: note.priority,
      status: note.recipient_type === 'all' ? 'active' : 'active', // All notices are active
      created_at: note.created_at,
      updated_at: note.updated_at
    }));
    
    res.json({ success: true, data: formattedNotes });
  } catch (error) {
    // If table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      console.log('Notices table does not exist, returning empty array');
      return res.json({ success: true, data: [] });
    }
    console.error('Error fetching all notes:', error);
    res.status(500).json({ success: false, message: 'Error fetching notes', error: error.message });
  }
};

// Create new note (admin only) - using notices table
const createNote = async (req, res) => {
  try {
    const { title, message, priority = 'medium' } = req.body;
    const adminId = req.user?.userId || null;
    
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    // Map priority: 'normal' -> 'medium', 'high' -> 'high', 'urgent' -> 'high'
    let mappedPriority = priority;
    if (priority === 'normal') mappedPriority = 'medium';
    if (priority === 'urgent') mappedPriority = 'high';

    const [result] = await pool.execute(
      `INSERT INTO notices (title, message, sender_type, sender_id, recipient_type, priority, created_at, updated_at)
       VALUES (?, ?, 'admin', ?, 'all', ?, NOW(), NOW())`,
      [title, message, adminId, mappedPriority]
    );

    res.json({
      success: true,
      message: 'Note created successfully',
      data: { id: result.insertId, title, message, priority: mappedPriority }
    });
  } catch (error) {
    // If table doesn't exist, return error with helpful message
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      console.error('Notices table does not exist');
      return res.status(500).json({ 
        success: false, 
        message: 'Notices table does not exist. Please create the table first.',
        error: error.message 
      });
    }
    console.error('Error creating note:', error);
    res.status(500).json({ success: false, message: 'Error creating note', error: error.message });
  }
};

// Update note (admin only) - using notices table
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, priority, status } = req.body;

    const updates = [];
    const values = [];

    if (title) { updates.push('title = ?'); values.push(title); }
    if (message) { updates.push('message = ?'); values.push(message); }
    if (priority) { 
      // Map priority: 'normal' -> 'medium', 'urgent' -> 'high'
      let mappedPriority = priority;
      if (priority === 'normal') mappedPriority = 'medium';
      if (priority === 'urgent') mappedPriority = 'high';
      updates.push('priority = ?'); 
      values.push(mappedPriority); 
    }
    // Note: notices table doesn't have status field, so we ignore it
    // If status is 'inactive' or 'archived', we could set recipient_type to something else, but for now we'll ignore it
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    updates.push('updated_at = NOW()');
    values.push(id);

    await pool.execute(
      `UPDATE notices SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: 'Note updated successfully' });
  } catch (error) {
    // If table doesn't exist, return error with helpful message
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      console.error('Notices table does not exist');
      return res.status(500).json({ 
        success: false, 
        message: 'Notices table does not exist. Please create the table first.',
        error: error.message 
      });
    }
    console.error('Error updating note:', error);
    res.status(500).json({ success: false, message: 'Error updating note', error: error.message });
  }
};

// Delete note (admin only) - using notices table
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM notices WHERE id = ?', [id]);

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    // If table doesn't exist, return error with helpful message
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes("doesn't exist")) {
      console.error('Notices table does not exist');
      return res.status(500).json({ 
        success: false, 
        message: 'Notices table does not exist. Please create the table first.',
        error: error.message 
      });
    }
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

