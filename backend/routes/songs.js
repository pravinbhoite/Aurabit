const express = require('express');
const router = express.Router();
const {
  uploadSong,
  getAllSongs,
  getSongById,
  streamSong,
  toggleLikeSong,
  recordPlay,
  getTrendingSongs,
} = require('../controllers/songController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// GET /api/songs — get all songs (paginated)
router.get('/', getAllSongs);

// GET /api/songs/trending — top 10 by play count (must be before /:id)
router.get('/trending', getTrendingSongs);

// GET /api/songs/stream/:id — IMPORTANT: must be before /:id
router.get('/stream/:id', streamSong);

// GET /api/songs/:id — get single song
router.get('/:id', getSongById);

// POST /api/songs/upload — admin only
router.post(
  '/upload',
  protect,
  adminOnly,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  uploadSong
);

// PUT /api/songs/:id/like — toggle like
router.put('/:id/like', protect, toggleLikeSong);

// POST /api/songs/:id/play — record play
router.post('/:id/play', protect, recordPlay);

module.exports = router;
