const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../middleware/auth');
const nssNccController = require('../controllers/nssNccController');

// Public routes - get NSS/NCC students (for public page)
router.get('/nss/students', nssNccController.getNSSStudents);
router.get('/ncc/students', nssNccController.getNCCStudents);

// Admin routes - require authentication
router.post('/nss/students', authenticate, checkRole('admin'), nssNccController.addNSSStudent);
router.put('/nss/students/:id', authenticate, checkRole('admin'), nssNccController.updateNSSStudent);
router.delete('/nss/students/:id', authenticate, checkRole('admin'), nssNccController.deleteNSSStudent);

router.post('/ncc/students', authenticate, checkRole('admin'), nssNccController.addNCCStudent);
router.put('/ncc/students/:id', authenticate, checkRole('admin'), nssNccController.updateNCCStudent);
router.delete('/ncc/students/:id', authenticate, checkRole('admin'), nssNccController.deleteNCCStudent);

module.exports = router;

