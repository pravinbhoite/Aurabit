const Song = require('../models/Song');
const User = require('../models/User');

// @desc    Get AI-powered song recommendations for a user
// @route   GET /api/recommendations/:userId
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Security: only allow users to get their own recommendations
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(userId)
      .populate('recentlyPlayed.song')
      .populate('likedSongs');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // ── Step 1: Build weighted preference profile ────────────────────────────
    // Liked songs count 3× more than recently played — they signal stronger intent
    const LIKED_WEIGHT   = 3;
    const RECENT_WEIGHT  = 1;

    const genreScore  = {};
    const moodScore   = {};
    const artistScore = {};
    const seenSongIds = new Set();

    const trackPreferences = (song, weight) => {
      if (!song) return;
      seenSongIds.add(song._id.toString());
      genreScore[song.genre]   = (genreScore[song.genre]   || 0) + weight;
      moodScore[song.mood]     = (moodScore[song.mood]     || 0) + weight;
      artistScore[song.artist] = (artistScore[song.artist] || 0) + weight;
    };

    user.recentlyPlayed.forEach((entry) => trackPreferences(entry.song, RECENT_WEIGHT));
    user.likedSongs.forEach((song)        => trackPreferences(song,      LIKED_WEIGHT));

    const topGenres  = Object.entries(genreScore).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);
    const topMoods   = Object.entries(moodScore).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m);
    const topArtists = Object.entries(artistScore).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([a]) => a);

    // ── Step 2: Content-based fetch (genre OR mood OR artist match) ───────────
    let contentBased = [];
    if (topGenres.length || topMoods.length || topArtists.length) {
      const orFilter = [];
      if (topGenres.length)  orFilter.push({ genre:  { $in: topGenres  } });
      if (topMoods.length)   orFilter.push({ mood:   { $in: topMoods   } });
      if (topArtists.length) orFilter.push({ artist: { $in: topArtists } });

      contentBased = await Song.find({
        $or: orFilter,
        _id: { $nin: Array.from(seenSongIds) },
      }).sort({ plays: -1 }).limit(30);
    }

    // ── Step 3: Score each candidate song by relevance ────────────────────────
    // Scoring: +3 genre match, +2 mood match, +4 artist match, +1 per 100 plays
    const scoreMap = {};
    for (const song of contentBased) {
      let score = 0;
      if (topGenres.includes(song.genre))   score += 3 * (genreScore[song.genre]   || 1);
      if (topMoods.includes(song.mood))     score += 2 * (moodScore[song.mood]     || 1);
      if (topArtists.includes(song.artist)) score += 4 * (artistScore[song.artist] || 1);
      score += Math.floor((song.plays || 0) / 100); // mild popularity boost
      scoreMap[song._id.toString()] = score;
    }
    contentBased.sort((a, b) => (scoreMap[b._id] || 0) - (scoreMap[a._id] || 0));

    // ── Step 4: Collaborative filtering ───────────────────────────────────────
    // Find users who liked at least one of the same songs and collect their liked songs
    const likedSongIds = user.likedSongs.map((s) => s._id);
    let collaborative  = [];

    if (likedSongIds.length > 0) {
      const similarUsers = await User.find({
        _id: { $ne: userId },
        likedSongs: { $in: likedSongIds },
      }).select('likedSongs').limit(20);

      const collaborativeScores = {};
      for (const simUser of similarUsers) {
        for (const songId of simUser.likedSongs) {
          const key = songId.toString();
          if (!seenSongIds.has(key)) {
            collaborativeScores[key] = (collaborativeScores[key] || 0) + 1;
          }
        }
      }

      const rankedIds = Object.entries(collaborativeScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      if (rankedIds.length > 0) {
        collaborative = await Song.find({ _id: { $in: rankedIds } });
      }
    }

    // ── Step 5: Fallback — trending if user has no history ───────────────────
    let trending = [];
    if (contentBased.length === 0 && collaborative.length === 0) {
      trending = await Song.find().sort({ plays: -1, createdAt: -1 }).limit(20);
    }

    // ── Step 6: Merge, deduplicate, cap at 20 ────────────────────────────────
    // Collaborative goes first (strongest signal), then scored content-based, then trending
    const seen   = new Set();
    const merged = [...collaborative, ...contentBased, ...trending].filter((song) => {
      const id = song._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    res.json({
      recommendations: merged.slice(0, 20),
      meta: {
        topGenres,
        topMoods,
        topArtists,
        contentBasedCount:    contentBased.length,
        collaborativeCount:   collaborative.length,
        isFallback:           trending.length > 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { getRecommendations };
