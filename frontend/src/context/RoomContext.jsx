import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { usePlayer } from './PlayerContext';

const RoomContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const RoomProvider = ({ children }) => {
  const { playSong, seek, togglePlay, currentSong, isPlaying } = usePlayer();

  const socketRef = useRef(null);
  const [room, setRoom]       = useState(null);   // current room state
  const [isHost, setIsHost]   = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Lazy-init socket (only once)
  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });
    }
    return socketRef.current;
  }, []);

  // Attach listeners when socket is created / room changes
  useEffect(() => {
    if (!isInRoom) return;
    const socket = socketRef.current;
    if (!socket) return;

    const onSync = ({ isPlaying: playing, seekPct }) => {
      seek(seekPct);
      // Let PlayerContext audio element handle play/pause
      const audio = document.querySelector('audio');
      if (!audio) return;
      if (playing && audio.paused)  audio.play().catch(() => {});
      if (!playing && !audio.paused) audio.pause();
    };

    const onSongChanged = ({ song }) => {
      if (song) playSong(song, [song]);
    };

    const onMembersUpdated = ({ members }) => {
      setRoom((prev) => prev ? { ...prev, members } : prev);
    };

    const onEnded = ({ message }) => {
      setRoomError(message || 'Room ended.');
      leaveRoom();
    };

    socket.on('room:sync',            onSync);
    socket.on('room:song-changed',    onSongChanged);
    socket.on('room:members-updated', onMembersUpdated);
    socket.on('room:ended',           onEnded);

    return () => {
      socket.off('room:sync',            onSync);
      socket.off('room:song-changed',    onSongChanged);
      socket.off('room:members-updated', onMembersUpdated);
      socket.off('room:ended',           onEnded);
    };
  }, [isInRoom, playSong, seek]); // eslint-disable-line

  // Create a new room
  const createRoom = useCallback((name) => {
    return new Promise((resolve) => {
      const socket = getSocket();
      setConnecting(true);
      setRoomError(null);

      // Bail out if socket can't connect within 8 seconds
      const timeout = setTimeout(() => {
        setConnecting(false);
        setRoomError('Cannot connect to the server. Make sure the backend is running on port 5000.');
        resolve({ success: false });
        socket.off('room:joined', onJoined); // eslint-disable-line
      }, 8000);

      const onJoined = (data) => {
        clearTimeout(timeout);
        setRoom(data);
        setIsHost(data.isHost);
        setIsInRoom(true);
        setConnecting(false);
        resolve({ success: true, code: data.code });
      };

      socket.once('room:joined', onJoined);
      socket.emit('room:create', { name });
    });
  }, [getSocket]);

  // Join an existing room by code
  const joinRoom = useCallback((code, name) => {
    return new Promise((resolve) => {
      const socket = getSocket();
      setConnecting(true);
      setRoomError(null);

      const timeout = setTimeout(() => {
        setConnecting(false);
        setRoomError('Cannot connect to the server. Make sure the backend is running on port 5000.');
        resolve({ success: false });
        socket.off('room:joined', onJoined); // eslint-disable-line
        socket.off('room:error',  onError);  // eslint-disable-line
      }, 8000);

      const onJoined = (data) => {
        clearTimeout(timeout);
        setRoom(data);
        setIsHost(data.isHost);
        setIsInRoom(true);
        setConnecting(false);
        if (data.song) playSong(data.song, [data.song]);
        resolve({ success: true });
        socket.off('room:error', onError); // eslint-disable-line
      };

      const onError = ({ message }) => {
        clearTimeout(timeout);
        setRoomError(message);
        setConnecting(false);
        resolve({ success: false, message });
        socket.off('room:joined', onJoined);
      };

      socket.once('room:joined', onJoined);
      socket.once('room:error',  onError);
      socket.emit('room:join', { code: code.toUpperCase(), name });
    });
  }, [getSocket, playSong]);


  // Leave and clean up
  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('room:leave');
    }
    setRoom(null);
    setIsHost(false);
    setIsInRoom(false);
  }, []);

  // ── Host-only broadcast helpers ──────────────────────────────────────────
  const broadcastPlay = useCallback(() => {
    if (!isHost || !room) return;
    socketRef.current?.emit('room:play', { code: room.code });
  }, [isHost, room]);

  const broadcastPause = useCallback(() => {
    if (!isHost || !room) return;
    socketRef.current?.emit('room:pause', { code: room.code });
  }, [isHost, room]);

  const broadcastSeek = useCallback((seekPct) => {
    if (!isHost || !room) return;
    socketRef.current?.emit('room:seek', { code: room.code, seekPct });
  }, [isHost, room]);

  const broadcastSongChange = useCallback((song) => {
    if (!isHost || !room) return;
    socketRef.current?.emit('room:song-change', { code: room.code, song });
  }, [isHost, room]);

  return (
    <RoomContext.Provider value={{
      room, isHost, isInRoom, connecting, roomError,
      createRoom, joinRoom, leaveRoom,
      broadcastPlay, broadcastPause, broadcastSeek, broadcastSongChange,
      setRoomError,
    }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoom must be inside RoomProvider');
  return ctx;
};
