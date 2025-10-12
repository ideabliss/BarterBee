const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://barter-bee.vercel.app",
        "https://barterbee.vercel.app",
        /\.vercel\.app$/  // Allow all Vercel preview deployments
      ],
      methods: ["GET", "POST"],
      credentials: true
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
      const roomName = `video-${sessionId}`;
      
      // Get existing room members before joining
      const room = io.sockets.adapter.rooms.get(roomName);
      const existingMembers = room ? Array.from(room) : [];
      
      console.log(`👤 User ${userName} (${socket.id}) joining video room: ${sessionId}`);
      console.log(`👥 Existing members in room:`, existingMembers.length);
      
      // Join the room
      socket.join(roomName);
      socket.userId = userId;
      socket.userName = userName;
      socket.sessionId = sessionId;
      
      // Notify existing users about the new user
      socket.to(roomName).emit('user-joined', {
        userId,
        userName,
        socketId: socket.id
      });
      console.log(`📤 Notified ${existingMembers.length} existing users about ${userName} joining`);
      
      // Send existing members to the new user
      existingMembers.forEach(memberId => {
        const memberSocket = io.sockets.sockets.get(memberId);
        if (memberSocket && memberSocket.userId) {
          console.log(`📤 Notifying ${userName} about existing user ${memberSocket.userName}`);
          socket.emit('user-joined', {
            userId: memberSocket.userId,
            userName: memberSocket.userName,
            socketId: memberId
          });
        }
      });
    });

    socket.on('offer', (data) => {
      console.log(`📤 Relaying offer from ${socket.userName} to room video-${data.sessionId}`);
      socket.to(`video-${data.sessionId}`).emit('offer', {
        ...data,
        fromUserId: socket.userId,
        fromUserName: socket.userName
      });
    });

    socket.on('answer', (data) => {
      console.log(`📤 Relaying answer from ${socket.userName} to room video-${data.sessionId}`);
      socket.to(`video-${data.sessionId}`).emit('answer', {
        ...data,
        fromUserId: socket.userId,
        fromUserName: socket.userName
      });
    });

    socket.on('ice-candidate', (data) => {
      console.log(`🧊 Relaying ICE candidate from ${socket.userName} to room video-${data.sessionId}`);
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
      console.log('❌ User disconnected:', socket.id, socket.userName);
      
      // Notify the specific video room about disconnection
      if (socket.sessionId) {
        socket.to(`video-${socket.sessionId}`).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName,
          socketId: socket.id
        });
        console.log(`📤 Notified video room ${socket.sessionId} about ${socket.userName} leaving`);
      }
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