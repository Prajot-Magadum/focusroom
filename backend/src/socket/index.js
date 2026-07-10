const { Server } = require('socket.io');
const env = require('../config/env');
const verifyToken = require('../utils/verifyToken');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  // Identify the socket's user if a token was provided. This does NOT
  // reject the connection when there's no/invalid token -- anonymous
  // sockets can still connect (e.g. the landing page's backend-status
  // widget), they just can't send chat messages.
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    socket.data.user = await verifyToken(token);
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Subscribing only joins the Socket.IO broadcast room -- it does NOT
    // record membership in the database. Actual join/leave persistence
    // happens via the REST endpoints (POST /rooms/:id/join|leave), which
    // then broadcast the updated member list to this channel.
    socket.on('room:subscribe', (roomId) => {
      if (typeof roomId !== 'string' || !roomId.trim()) return;
      socket.join(roomId);
    });

    socket.on('room:unsubscribe', (roomId) => {
      if (typeof roomId !== 'string' || !roomId.trim()) return;
      socket.leave(roomId);
    });

    // Ephemeral chat -- not persisted anywhere, just relayed to everyone
    // currently subscribed to the room.
    socket.on('chat:message', (payload) => {
      const user = socket.data.user;
      if (!user) return;

      const { roomId, text } = payload || {};
      if (typeof roomId !== 'string' || !roomId.trim()) return;
      if (typeof text !== 'string' || !text.trim()) return;
      if (!socket.rooms.has(roomId)) return; // must be subscribed first

      const message = {
        id: `${socket.id}-${Date.now()}`,
        roomId,
        userId: user.id,
        displayName: user.user_metadata?.full_name || user.email || 'Someone',
        text: text.trim().slice(0, 1000),
        sentAt: new Date().toISOString(),
      };

      io.to(roomId).emit('chat:message', message);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

module.exports = initSocket;