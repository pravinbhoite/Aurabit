const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
    },
    album: {
      type: String,
      default: 'Unknown Album',
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: [
        'Pop',
        'Rock',
        'Hip-Hop',
        'Jazz',
        'Classical',
        'Electronic',
        'R&B',
        'Country',
        'Indie',
        'Metal',
        'Lo-fi',
        'Other',
      ],
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      enum: [
        'Happy',
        'Sad',
        'Energetic',
        'Calm',
        'Romantic',
        'Angry',
        'Focused',
        'Party',
        'Chill',
      ],
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio file is required'],
    },
    coverImage: {
      type: String,
      default: '/uploads/default-cover.png',
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    plays: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Text indexes for search
songSchema.index({ title: 'text', artist: 'text', album: 'text' });

module.exports = mongoose.model('Song', songSchema);
