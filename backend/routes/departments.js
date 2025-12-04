const express = require('express');
const router = express.Router();
const { getAllDepartments, getDepartmentById } = require('../controllers/departmentController');

router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);

module.exports = router;

