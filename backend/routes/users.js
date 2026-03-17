const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllUsers, getLikedSongs, getProfile } = require('../controllers/userController');

// GET /api/users/all  — Admin only
router.get('/all', protect, adminOnly, getAllUsers);

// GET /api/users/liked-songs — current user's liked songs (populated)
router.get('/liked-songs', protect, getLikedSongs);

// GET /api/users/profile — current user's profile + counts
router.get('/profile', protect, getProfile);

module.exports = router;
