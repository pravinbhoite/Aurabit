const Playlist = require('../models/Playlist');
const User = require('../models/User');

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    if (!name) return res.status(400).json({ message: 'Playlist name is required' });

    const playlist = await Playlist.create({
      name,
      description,
      userId: req.user._id,
      isPublic: isPublic || false,
    });

    // Add playlist reference to user
    await User.findByIdAndUpdate(req.user._id, { $push: { playlists: playlist._id } });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all playlists for logged-in user
// @route   GET /api/playlists
// @access  Private
const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id })
      .populate('songs')
      .sort({ updatedAt: -1 });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get a single playlist by ID
// @route   GET /api/playlists/:id
// @access  Public (public playlists) / Private (private)
const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs').populate('userId', 'name');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    if (!playlist.isPublic && playlist.userId._id.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Add a song to playlist
// @route   PUT /api/playlists/:id/add-song
// @access  Private
const addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(songId);
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Remove a song from playlist
// @route   PUT /api/playlists/:id/remove-song
// @access  Private
const removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    playlist.songs = playlist.songs.filter((id) => id.toString() !== songId);
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await playlist.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $pull: { playlists: playlist._id } });

    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
};
