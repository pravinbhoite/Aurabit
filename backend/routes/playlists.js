const express = require('express');
const router = express.Router();
const {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/playlists — get current user's playlists
router.get('/', protect, getUserPlaylists);

// POST /api/playlists — create new playlist
router.post('/', protect, createPlaylist);

// GET /api/playlists/:id — get single playlist
router.get('/:id', protect, getPlaylistById);

// DELETE /api/playlists/:id — delete playlist
router.delete('/:id', protect, deletePlaylist);

// PUT /api/playlists/:id/add-song — add a song to playlist
router.put('/:id/add-song', protect, addSongToPlaylist);

// PUT /api/playlists/:id/remove-song — remove a song from playlist
router.put('/:id/remove-song', protect, removeSongFromPlaylist);

module.exports = router;
