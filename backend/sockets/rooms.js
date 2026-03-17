/**
 * sockets/rooms.js
 * In-memory listening room management via Socket.io.
 *
 * Room shape:
 *   {
 *     code:      string,          // 6-char alphanumeric
 *     hostId:    string,          // socket.id of the host
 *     hostName:  string,
 *     members:   [{ socketId, name }],
 *     song:      object | null,   // current song object
 *     isPlaying: boolean,
 *     seekPct:   number,          // 0-100 progress %
 *   }
 */

const rooms = new Map(); // code → room

const genCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

// ── Helpers ────────────────────────────────────────────────────────────────
const roomPayload = (room) => ({
  code:      room.code,
  hostId:    room.hostId,
  hostName:  room.hostName,
  members:   room.members,
  song:      room.song,
  isPlaying: room.isPlaying,
  seekPct:   room.seekPct,
});

const cleanupSocket = (io, socketId) => {
  for (const [code, room] of rooms) {
    const wasMember = room.members.some((m) => m.socketId === socketId);
    if (!wasMember) continue;

    room.members = room.members.filter((m) => m.socketId !== socketId);

    if (room.hostId === socketId) {
      // Host left → destroy room, notify everyone
      io.to(code).emit('room:ended', { message: 'The host left the room.' });
      rooms.delete(code);
    } else if (room.members.length > 0) {
      // Guest left → notify remaining members
      io.to(code).emit('room:members-updated', { members: room.members });
    } else {
      rooms.delete(code); // empty room
    }
    break;
  }
};

// ── Main socket handler ─────────────────────────────────────────────────────
module.exports = (io) => {
  io.on('connection', (socket) => {

    // Create a new room
    socket.on('room:create', ({ name }) => {
      let code;
      do { code = genCode(); } while (rooms.has(code));

      const room = {
        code,
        hostId:    socket.id,
        hostName:  name,
        members:   [{ socketId: socket.id, name }],
        song:      null,
        isPlaying: false,
        seekPct:   0,
      };
      rooms.set(code, room);
      socket.join(code);
      socket.emit('room:joined', { ...roomPayload(room), isHost: true });
    });

    // Join an existing room
    socket.on('room:join', ({ code, name }) => {
      const room = rooms.get(code?.toUpperCase());
      if (!room) {
        socket.emit('room:error', { message: `Room "${code}" not found.` });
        return;
      }
      // Don't double-add
      if (!room.members.find((m) => m.socketId === socket.id)) {
        room.members.push({ socketId: socket.id, name });
      }
      socket.join(room.code);

      // Tell the joiner the full room state
      socket.emit('room:joined', { ...roomPayload(room), isHost: false });

      // Tell everyone else a new member arrived
      socket.to(room.code).emit('room:members-updated', { members: room.members });
    });

    // Host: change song
    socket.on('room:song-change', ({ code, song }) => {
      const room = rooms.get(code);
      if (!room || room.hostId !== socket.id) return;
      room.song      = song;
      room.isPlaying = true;
      room.seekPct   = 0;
      io.to(code).emit('room:song-changed', { song, isPlaying: true, seekPct: 0 });
    });

    // Host: play
    socket.on('room:play', ({ code }) => {
      const room = rooms.get(code);
      if (!room || room.hostId !== socket.id) return;
      room.isPlaying = true;
      socket.to(code).emit('room:sync', { isPlaying: true, seekPct: room.seekPct });
    });

    // Host: pause
    socket.on('room:pause', ({ code }) => {
      const room = rooms.get(code);
      if (!room || room.hostId !== socket.id) return;
      room.isPlaying = false;
      socket.to(code).emit('room:sync', { isPlaying: false, seekPct: room.seekPct });
    });

    // Host: seek
    socket.on('room:seek', ({ code, seekPct }) => {
      const room = rooms.get(code);
      if (!room || room.hostId !== socket.id) return;
      room.seekPct = seekPct;
      socket.to(code).emit('room:sync', { isPlaying: room.isPlaying, seekPct });
    });

    // Leave room explicitly
    socket.on('room:leave', () => cleanupSocket(io, socket.id));

    // Disconnect cleanup
    socket.on('disconnect', () => cleanupSocket(io, socket.id));
  });
};
