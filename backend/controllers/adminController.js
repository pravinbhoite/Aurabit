const User = require('../models/User');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private / Admin
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalSongs, totalPlaylists, mostPlayedArr] = await Promise.all([
      User.countDocuments({}),
      Song.countDocuments({}),
      Playlist.countDocuments({}),
      Song.find({}).sort({ plays: -1 }).limit(1).select('title artist plays coverImage'),
    ]);

    const mostPlayedSong = mostPlayedArr[0] || null;

    res.json({
      totalUsers,
      totalSongs,
      totalPlaylists,
      mostPlayedSong,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { getStats };
