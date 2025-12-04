const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, checkRole } = require('../middleware/auth');
const teacherController = require('../controllers/teacherController');

// All routes require teacher authentication
router.use(authenticate);
router.use(checkRole('teacher'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/assignments'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `assignment-${req.user.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
  }
});

router.get('/students', teacherController.getStudentList);
router.get('/assignments', teacherController.getAssignments);
router.post('/assignments', upload.single('file'), teacherController.createAssignment);
router.put('/assignments', teacherController.updateAssignment);
router.get('/attendance-graph', teacherController.getAttendanceGraph);
router.post('/attendance', teacherController.insertAttendance);
router.post('/marks', teacherController.insertMarks);
router.post('/send-message', teacherController.sendMessage);
router.get('/messages', teacherController.getMessages);
router.post('/send-notice', teacherController.sendNotice);
router.get('/notices', teacherController.getNotices);

module.exports = router;

