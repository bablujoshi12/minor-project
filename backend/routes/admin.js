const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require admin authentication
router.use(authenticate);
router.use(checkRole('admin'));

// Statistics
router.get('/statistics', adminController.getStatistics);
router.get('/statistics/enhanced', adminController.getEnhancedStatistics);

// Student Management
router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);
router.post('/students', adminController.createStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/user/student/:id', adminController.deleteUser);

// Teacher Management
router.get('/teachers', adminController.getTeachers);
router.get('/teachers/:id', adminController.getTeacherById);
router.post('/teachers', adminController.createTeacher);
router.put('/teachers/:id', adminController.updateTeacher);
router.delete('/user/teacher/:id', adminController.deleteUser);

// Parent Management
router.get('/parents', adminController.getParents);
router.delete('/user/parent/:id', adminController.deleteUser);

// Department Management
router.get('/departments', adminController.getDepartments);
router.get('/departments/:id', adminController.getDepartmentById);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// Branch Management
router.get('/branches', adminController.getBranches);
router.post('/branches', adminController.createBranch);
router.put('/branches/:id', adminController.updateBranch);
router.delete('/branches/:id', adminController.deleteBranch);

// HOD Management
router.get('/hods', adminController.getHODs);
router.post('/hods/assign', adminController.assignHOD);
router.delete('/hods/:department_id', adminController.removeHOD);

// Notices
router.post('/send-notice', adminController.sendNotice);
router.get('/notices', adminController.getNotices);
router.put('/notices/:id', adminController.updateNotice);
router.delete('/notices/:id', adminController.deleteNotice);

// Legacy route for backward compatibility
router.delete('/user/:type/:id', adminController.deleteUser);

module.exports = router;

