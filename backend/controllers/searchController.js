const Song = require('../models/Song');

// @desc    Search songs by title, artist, or album (text search)
// @route   GET /api/search?q=&genre=&mood=
// @access  Public
const search = async (req, res) => {
  try {
    const { q, genre, mood } = req.query;
    const filter = {};

    if (q) {
      filter.$text = { $search: q };
    }
    if (genre) filter.genre = genre;
    if (mood) filter.mood = mood;

    if (!q && !genre && !mood) {
      return res.status(400).json({ message: 'Provide at least one search parameter: q, genre, or mood' });
    }

    const songs = await Song.find(filter)
      .sort(q ? { score: { $meta: 'textScore' }, plays: -1 } : { plays: -1, createdAt: -1 })
      .limit(30);

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { search };
