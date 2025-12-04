const express = require('express');
const router = express.Router();
const notesBoardController = require('../controllers/notesBoardController');
const { authenticate, checkRole } = require('../middleware/auth');

// Public route - get active notes for homepage
router.get('/public', notesBoardController.getPublicNotes);

// Admin routes - require authentication and admin role
router.use(authenticate);
router.use(checkRole('admin'));

router.get('/all', notesBoardController.getAllNotes);
router.post('/create', notesBoardController.createNote);
router.put('/:id', notesBoardController.updateNote);
router.delete('/:id', notesBoardController.deleteNote);

module.exports = router;

