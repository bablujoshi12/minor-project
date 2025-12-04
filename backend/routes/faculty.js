const express = require('express');
const router = express.Router();
const { getAllFaculty, getFacultyByDepartment } = require('../controllers/facultyController');

router.get('/', getAllFaculty);
router.get('/department/:id', getFacultyByDepartment);

module.exports = router;

