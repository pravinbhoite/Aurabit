const User = require('../models/User');
const Song = require('../models/Song');

// @desc    Get current user's public profile + counts
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      joinedAt: user.createdAt,
      lastLogin: user.lastLogin,
      totalLikedSongs: user.likedSongs.length,
      totalPlaylists: user.playlists.length,
      totalRecentlyPlayed: user.recentlyPlayed.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users/all
// @access  Private / Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get current user's liked songs (populated)
// @route   GET /api/users/liked-songs
// @access  Private
const getLikedSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('likedSongs')
      .select('likedSongs');
    res.json(user.likedSongs.reverse()); // newest liked first
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { getAllUsers, getLikedSongs, getProfile };
