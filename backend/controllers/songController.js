const path = require('path');
const fs = require('fs');
const Song = require('../models/Song');
const User = require('../models/User');

// @desc    Upload a song (admin)
// @route   POST /api/songs/upload
// @access  Private/Admin
const uploadSong = async (req, res) => {
  try {
    const { title, artist, album, genre, mood, duration } = req.body;

    if (!title || !artist || !genre || !mood) {
      return res.status(400).json({ message: 'Title, artist, genre, and mood are required' });
    }

    if (!req.files || !req.files.audio) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const audioUrl = `/uploads/${req.files.audio[0].filename}`;
    const coverImage = req.files.cover
      ? `/uploads/${req.files.cover[0].filename}`
      : '/uploads/default-cover.png';

    const song = await Song.create({
      title,
      artist,
      album: album || 'Unknown Album',
      genre,
      mood,
      audioUrl,
      coverImage,
      duration: duration ? Number(duration) : 0,
      uploadedBy: req.user._id,
    });

    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all songs
// @route   GET /api/songs
// @access  Public
const getAllSongs = async (req, res) => {
  try {
    const { genre, mood, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (genre) filter.genre = genre;
    if (mood) filter.mood = mood;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const songs = await Song.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name');

    const total = await Song.countDocuments(filter);
    res.json({ songs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get single song by ID
// @route   GET /api/songs/:id
// @access  Public
const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'name');
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Stream audio with HTTP Range support
// @route   GET /api/songs/stream/:id
// @access  Public
const streamSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Strip leading slash to get relative path from uploads
    const audioPath = path.join(__dirname, '..', song.audioUrl);

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ message: 'Audio file not found on server' });
    }

    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Increment play count (fire and forget)
    Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }).exec();

    if (range) {
      // Parse Range header: "bytes=start-end"
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(audioPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      });

      fileStream.pipe(res);
    } else {
      // No range header — send full file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });
      fs.createReadStream(audioPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Like / Unlike a song
// @route   PUT /api/songs/:id/like
// @access  Private
const toggleLikeSong = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const songId = req.params.id;

    const isLiked = user.likedSongs.includes(songId);

    if (isLiked) {
      user.likedSongs = user.likedSongs.filter((id) => id.toString() !== songId);
    } else {
      user.likedSongs.push(songId);
    }

    await user.save();
    res.json({ liked: !isLiked, likedSongs: user.likedSongs });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Record recently played
// @route   POST /api/songs/:id/play
// @access  Private
const recordPlay = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Keep only last 20 recently played, remove duplicate if exists
    user.recentlyPlayed = user.recentlyPlayed.filter(
      (entry) => entry.song.toString() !== req.params.id
    );
    user.recentlyPlayed.unshift({ song: req.params.id, playedAt: new Date() });
    if (user.recentlyPlayed.length > 20) user.recentlyPlayed = user.recentlyPlayed.slice(0, 20);

    await user.save();
    res.json({ message: 'Recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get top 10 songs by play count
// @route   GET /api/songs/trending
// @access  Public
const getTrendingSongs = async (req, res) => {
  try {
    const songs = await Song.find({})
      .sort({ plays: -1 })
      .limit(10)
      .populate('uploadedBy', 'name');
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { uploadSong, getAllSongs, getSongById, streamSong, toggleLikeSong, recordPlay, getTrendingSongs };

