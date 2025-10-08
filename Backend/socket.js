const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Chat functionality
    socket.on('join-chat', (barterRequestId) => {
      socket.join(`chat-${barterRequestId}`);
      console.log(`User ${socket.id} joined chat-${barterRequestId}`);
    });

    socket.on('send-message', (data) => {
      socket.to(`chat-${data.barterRequestId}`).emit('receive-message', data);
    });

    // Video call functionality
    socket.on('join-video-room', (data) => {
      const { sessionId, userId, userName } = data;
      socket.join(`video-${sessionId}`);
      socket.userId = userId;
      socket.userName = userName;
      
      console.log(`User ${userName} (${socket.id}) joined video room: ${sessionId}`);
      
      // Notify other users in the room
      socket.to(`video-${sessionId}`).emit('user-joined', {
        userId,
        userName,
        socketId: socket.id
      });
    });

    socket.on('offer', (data) => {
      console.log('Relaying offer from', socket.userName, 'to room', data.sessionId);
      socket.to(`video-${data.sessionId}`).emit('offer', {
        ...data,
        fromUserId: socket.userId,
        fromUserName: socket.userName
      });
    });

    socket.on('answer', (data) => {
      console.log('Relaying answer from', socket.userName, 'to room', data.sessionId);
      socket.to(`video-${data.sessionId}`).emit('answer', {
        ...data,
        fromUserId: socket.userId,
        fromUserName: socket.userName
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(`video-${data.sessionId}`).emit('ice-candidate', data);
    });

    socket.on('video-chat-message', (data) => {
      socket.to(`video-${data.sessionId}`).emit('video-chat-message', data);
    });

    socket.on('leave-video-room', (sessionId) => {
      socket.to(`video-${sessionId}`).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName
      });
      socket.leave(`video-${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Notify video rooms about disconnection
      socket.broadcast.emit('user-left', {
        userId: socket.userId,
        userName: socket.userName
      });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };