const pool = require('../config/database');

// Get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    const [announcements] = await pool.query(
      `SELECT * FROM announcements 
       WHERE status = 'active' AND (expiry_date IS NULL OR expiry_date >= CURDATE())
       ORDER BY posted_on DESC, created_at DESC`
    );
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcements', error: error.message });
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const [announcements] = await pool.query(
      'SELECT * FROM announcements WHERE id = ?',
      [id]
    );
    
    if (announcements.length === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, data: announcements[0] });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcement', error: error.message });
  }
};

module.exports = {
  getAllAnnouncements,
  getAnnouncementById
};

