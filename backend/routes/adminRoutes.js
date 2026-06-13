const express = require('express');
const router = express.Router();
const { getStats, getUsers, getAllDoctors, toggleUserStatus, seedDoctors } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getStats);
router.get('/users', protect, adminOnly, getUsers);
router.get('/doctors', protect, adminOnly, getAllDoctors);
router.put('/users/:id/toggle', protect, adminOnly, toggleUserStatus);
router.post('/seed', seedDoctors); // Open for initial setup

module.exports = router;
