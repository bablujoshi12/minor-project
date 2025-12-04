const express = require('express');
const router = express.Router();
const { register, login, parentLogin } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/parent-login', parentLogin);

module.exports = router;

