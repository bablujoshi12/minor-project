// Gallery API Endpoint
// This is a sample Node.js/Express API endpoint structure
// You can use this as reference for your backend

const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'your_db_user',
  password: 'your_db_password',
  database: 'gpl_lohaghat_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

/**
 * GET /api/gallery
 * Get all active gallery images for slide gallery
 * Returns: Array of image objects ordered by display_order
 */
router.get('/gallery', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get all active images ordered by display_order
    const [rows] = await connection.query(
      `SELECT 
        id,
        image_url,
        image_title,
        category,
        alt_text,
        display_order
      FROM gallery_images 
      WHERE is_active = 1 
      ORDER BY display_order ASC, id ASC`
    );
    
    connection.release();
    
    // Return just the image URLs array for slide gallery
    // Or return full objects if needed
    const imageUrls = rows.map(row => row.image_url);
    
    res.json({
      success: true,
      data: imageUrls, // For slide gallery, just URLs
      images: rows,     // Full image objects if needed
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery images',
      error: error.message
    });
  }
});

/**
 * GET /api/gallery/full
 * Get all gallery images with full details
 */
router.get('/gallery/full', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      `SELECT 
        id,
        image_url,
        image_title,
        category,
        alt_text,
        display_order,
        created_at
      FROM gallery_images 
      WHERE is_active = 1 
      ORDER BY display_order ASC, id ASC`
    );
    
    connection.release();
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery images',
      error: error.message
    });
  }
});

/**
 * GET /api/gallery/category/:category
 * Get images by category
 */
router.get('/gallery/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query(
      `SELECT 
        id,
        image_url,
        image_title,
        category,
        alt_text,
        display_order
      FROM gallery_images 
      WHERE is_active = 1 AND category = ?
      ORDER BY display_order ASC, id ASC`,
      [category]
    );
    
    connection.release();
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching gallery by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery images',
      error: error.message
    });
  }
});

/**
 * POST /api/gallery
 * Add new gallery image
 */
router.post('/gallery', async (req, res) => {
  try {
    const { image_url, image_title, category, alt_text, display_order } = req.body;
    
    if (!image_url || !image_title) {
      return res.status(400).json({
        success: false,
        message: 'image_url and image_title are required'
      });
    }
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO gallery_images 
        (image_url, image_title, category, alt_text, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, 1)`,
      [
        image_url,
        image_title,
        category || 'Campus',
        alt_text || image_title,
        display_order || 0
      ]
    );
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Image added successfully',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error adding gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding gallery image',
      error: error.message
    });
  }
});

/**
 * PUT /api/gallery/:id
 * Update gallery image
 */
router.put('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, image_title, category, alt_text, display_order, is_active } = req.body;
    
    const connection = await pool.getConnection();
    
    const updateFields = [];
    const updateValues = [];
    
    if (image_url) { updateFields.push('image_url = ?'); updateValues.push(image_url); }
    if (image_title) { updateFields.push('image_title = ?'); updateValues.push(image_title); }
    if (category) { updateFields.push('category = ?'); updateValues.push(category); }
    if (alt_text) { updateFields.push('alt_text = ?'); updateValues.push(alt_text); }
    if (display_order !== undefined) { updateFields.push('display_order = ?'); updateValues.push(display_order); }
    if (is_active !== undefined) { updateFields.push('is_active = ?'); updateValues.push(is_active); }
    
    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updateValues.push(id);
    
    await connection.query(
      `UPDATE gallery_images 
      SET ${updateFields.join(', ')}
      WHERE id = ?`,
      updateValues
    );
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Image updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating gallery image',
      error: error.message
    });
  }
});

/**
 * DELETE /api/gallery/:id
 * Delete gallery image (soft delete - sets is_active to 0)
 */
router.delete('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE gallery_images SET is_active = 0 WHERE id = ?',
      [id]
    );
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting gallery image',
      error: error.message
    });
  }
});

module.exports = router;

