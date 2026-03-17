import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);   // 0-100
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const audio = audioRef.current;

  // Sync volume
  useEffect(() => {
    audio.volume = volume;
  }, [volume, audio]);

  // Update progress every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (!audio.paused && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setDuration(audio.duration);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [audio]);

  // Auto-play next song when current ends
  useEffect(() => {
    const handleEnded = () => playNext();
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [queue, queueIndex]); // eslint-disable-line

  const playSong = useCallback(
  (song, songQueue = []) => {
    const src = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/songs/stream/${song._id}`;

    audio.src = src;
    audio.load();

    audio.play()
      .then(() => setIsPlaying(true))
      .catch(console.error);

    setCurrentSong(song);
    setProgress(0);

    if (songQueue.length > 0) {
      setQueue(songQueue);
      setQueueIndex(songQueue.findIndex((s) => s._id === song._id));
    }

    // Fire-and-forget: record play count on backend
    const token = localStorage.getItem('aurabeat_token');
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/songs/${song._id}/play`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}); // silent — never affects playback
    }
  },
  [audio]
);
  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [audio, currentSong]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIndex);
    playSong(queue[nextIndex], queue);
  }, [queue, queueIndex, playSong]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    // If more than 3 seconds in, restart current song
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIndex);
    playSong(queue[prevIndex], queue);
  }, [queue, queueIndex, playSong, audio]);

  const seek = useCallback(
    (percent) => {
      if (audio.duration) {
        audio.currentTime = (percent / 100) * audio.duration;
        setProgress(percent);
      }
    },
    [audio]
  );

  const setVolume = useCallback((v) => {
    setVolumeState(v);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        queue,
        playSong,
        togglePlay,
        playNext,
        playPrev,
        seek,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
