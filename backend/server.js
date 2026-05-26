require('dotenv').config();
const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app    = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET','POST'] }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('join-user-room', (userId) => socket.join(`user-${userId}`));

  socket.on('join-room', ({ roomId, userId, userName }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) rooms.set(roomId, []);
    const existing = rooms.get(roomId).find(p => p.socketId === socket.id);
    if (!existing) rooms.get(roomId).push({ socketId:socket.id, userId, userName });
    socket.to(roomId).emit('user-joined', { userId, userName, socketId:socket.id });
    const peers = rooms.get(roomId).filter(p => p.socketId!==socket.id);
    socket.emit('room-peers', peers);
  });

  socket.on('offer',         ({ to, offer })     => io.to(to).emit('offer',         { from:socket.id, offer }));
  socket.on('answer',        ({ to, answer })    => io.to(to).emit('answer',        { from:socket.id, answer }));
  socket.on('ice-candidate', ({ to, candidate }) => io.to(to).emit('ice-candidate', { from:socket.id, candidate }));
  socket.on('chat-message',  ({ roomId, message, sender }) => io.to(roomId).emit('chat-message', { message, sender, timestamp:new Date() }));
  socket.on('notification',  ({ userId, notification }) => io.to(`user-${userId}`).emit('new-notification', notification));

  socket.on('disconnect', () => {
    rooms.forEach((peers, roomId) => {
      const idx = peers.findIndex(p => p.socketId===socket.id);
      if (idx !== -1) {
        const [left] = peers.splice(idx, 1);
        socket.to(roomId).emit('user-left', { socketId:socket.id, userId:left.userId });
        if (peers.length === 0) rooms.delete(roomId);
      }
    });
    console.log('🔌 Disconnected:', socket.id);
  });
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs:15*60*1000, max:200, message:{ success:false, message:'Too many requests' } }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/doctors',       require('./routes/doctorRoutes'));
app.use('/api/appointments',  require('./routes/appointmentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/records',       require('./routes/recordRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));

app.get('/health', (req, res) => res.json({ status:'ok', time: new Date(), env: process.env.NODE_ENV }));
app.get('/', (req, res) => res.json({ message:'MediConnect API v1.0 🏥' }));

// ── Error handler (must be last) ───────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`\n🚀 MediConnect server running on http://localhost:${PORT} [${process.env.NODE_ENV||'development'}]\n`));

module.exports = { app, io };
