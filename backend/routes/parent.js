const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../middleware/auth');
const parentController = require('../controllers/parentController');

// All routes require parent authentication
router.use(authenticate);
router.use(checkRole('parent'));

router.get('/children', parentController.getChildrenList);
router.post('/select-child', parentController.selectChild);
router.get('/child-attendance', parentController.getChildAttendance);
router.get('/child-assignments', parentController.getChildAssignments);
router.get('/child-marks', parentController.getChildMarks);
router.get('/child-semester-results', parentController.getChildSemesterResults);
router.post('/send-message', parentController.sendMessageToTeacher);
router.get('/messages', parentController.getMessages);
router.get('/notices', parentController.getNotices);

module.exports = router;

