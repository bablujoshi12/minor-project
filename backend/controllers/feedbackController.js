const pool = require('../config/database');

// Submit feedback
const submitFeedback = async (req, res) => {
  try {
    const { name, email, phone, department, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required' 
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO feedback (name, email, phone, department, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, department || null, message]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Feedback submitted successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, message: 'Error submitting feedback', error: error.message });
  }
};

// Get all feedback (for admin)
const getAllFeedback = async (req, res) => {
  try {
    const [feedback] = await pool.query(
      'SELECT * FROM feedback ORDER BY submitted_at DESC'
    );
    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, message: 'Error fetching feedback', error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback
};

