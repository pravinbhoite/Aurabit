const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/adminController');

// GET /api/admin/stats — admin dashboard metrics
router.get('/stats', protect, adminOnly, getStats);

module.exports = router;
