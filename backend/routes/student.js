const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// All routes require student authentication
router.use(authenticate);
router.use(checkRole('student'));

router.post('/upload-assignment', studentController.upload.single('assignment'), studentController.uploadAssignment);
router.post('/submit-assignment', studentController.upload.single('file'), studentController.submitAssignment);
router.get('/attendance-dashboard', studentController.getAttendanceDashboard);
router.get('/test-marks', studentController.getTestMarks);
router.get('/semester-results', studentController.getSemesterResults);
router.put('/health-info', studentController.updateHealthInfo);
router.get('/profile', studentController.getProfile);
router.get('/notices', studentController.getNotices);
router.get('/assignments', studentController.getAssignments);

module.exports = router;

