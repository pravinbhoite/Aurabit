const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/recommendations/:userId
router.get('/:userId', protect, getRecommendations);

module.exports = router;
