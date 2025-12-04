const express = require('express');
const router = express.Router();
const { getAllStudents, getStudentByRollNo, getStudentsByDepartment } = require('../controllers/studentPublicController');

router.get('/', getAllStudents);
router.get('/roll/:rollNo', getStudentByRollNo);
router.get('/department/:id', getStudentsByDepartment);

module.exports = router;

