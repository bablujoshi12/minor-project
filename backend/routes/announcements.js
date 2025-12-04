const express = require('express');
const router = express.Router();
const { getAllAnnouncements, getAnnouncementById } = require('../controllers/announcementController');

router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

module.exports = router;

