const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require admin authentication
router.use(authenticate);
router.use(checkRole('admin'));

router.get('/teachers', adminController.getTeachers);
router.get('/students', adminController.getStudents);
router.get('/parents', adminController.getParents);
router.get('/statistics', adminController.getStatistics);
router.post('/send-notice', adminController.sendNotice);
router.get('/notices', adminController.getNotices);
router.delete('/user/:type/:id', adminController.deleteUser);
router.get('/branches', adminController.getBranches);

module.exports = router;

