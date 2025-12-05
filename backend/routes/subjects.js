const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// Public routes (no authentication required for viewing subjects)
router.get('/', subjectController.getAllSubjects);
router.get('/semester/:semester', subjectController.getSubjectsBySemester);
router.get('/:id', subjectController.getSubjectById);

module.exports = router;

