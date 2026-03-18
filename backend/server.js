require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});
require('./sockets/rooms')(io);

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://aurabit-one.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files (uploaded audio & images) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/search', require('./routes/search'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🎵 AuraBeat API is running' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 AuraBeat server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for real-time listening rooms`);
  console.log(`📁 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
