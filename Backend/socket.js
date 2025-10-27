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
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Chat functionality
    socket.on('join-chat', (barterRequestId) => {
      socket.join(`chat-${barterRequestId}`);
      console.log(`💬 User ${socket.id} joined chat-${barterRequestId}`);
    });

    socket.on('send-message', (data) => {
      socket.to(`chat-${data.barterRequestId}`).emit('receive-message', data);
    });

    // ==================== VIDEO CALL FUNCTIONALITY ====================
    
    // Join video room
    socket.on('join-video-room', (data) => {
      const { sessionId, userId, userName } = data;
      const roomName = `video-${sessionId}`;
      
      // Store user info on socket
      socket.userId = userId;
      socket.userName = userName;
      socket.sessionId = sessionId;
      socket.roomName = roomName;
      
      // Get existing room members before joining
      const room = io.sockets.adapter.rooms.get(roomName);
      const existingMembers = room ? Array.from(room).filter(id => id !== socket.id) : [];
      
      console.log(`👤 User ${userName} (${userId}) joining video room: ${sessionId}`);
      console.log(`👥 Existing members in room:`, existingMembers.length);
      
      // Join the room
      socket.join(roomName);
      
      // Send list of existing users to the newly joined user
      const existingUsers = [];
      existingMembers.forEach(memberId => {
        const memberSocket = io.sockets.sockets.get(memberId);
        if (memberSocket && memberSocket.userId) {
          existingUsers.push({
            userId: memberSocket.userId,
            userName: memberSocket.userName,
            socketId: memberId
          });
        }
      });
      
      // Notify the new user about existing users
      if (existingUsers.length > 0) {
        console.log(`📤 Sending ${existingUsers.length} existing users to ${userName}`);
        socket.emit('existing-users', existingUsers);
      }
      
      // Notify existing users about the new user
      socket.to(roomName).emit('user-joined', {
        userId,
        userName,
        socketId: socket.id
      });
      console.log(`📤 Notified ${existingMembers.length} users about ${userName} joining`);
      
      // Send confirmation to the user
      socket.emit('room-joined', {
        roomName,
        sessionId,
        userCount: existingMembers.length + 1
      });
    });

    // WebRTC Signaling - Offer
    socket.on('webrtc-offer', (data) => {
      const { targetSocketId, offer, sessionId } = data;
      console.log(`📤 Forwarding offer from ${socket.userName} to ${targetSocketId}`);
      
      io.to(targetSocketId).emit('webrtc-offer', {
        offer,
        fromSocketId: socket.id,
        fromUserId: socket.userId,
        fromUserName: socket.userName,
        sessionId
      });
    });

    // WebRTC Signaling - Answer
    socket.on('webrtc-answer', (data) => {
      const { targetSocketId, answer, sessionId } = data;
      console.log(`📤 Forwarding answer from ${socket.userName} to ${targetSocketId}`);
      
      io.to(targetSocketId).emit('webrtc-answer', {
        answer,
        fromSocketId: socket.id,
        fromUserId: socket.userId,
        fromUserName: socket.userName,
        sessionId
      });
    });

    // WebRTC Signaling - ICE Candidate
    socket.on('webrtc-ice-candidate', (data) => {
      const { targetSocketId, candidate, sessionId } = data;
      console.log(`🧊 Forwarding ICE candidate from ${socket.userName} to ${targetSocketId}`);
      
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        candidate,
        fromSocketId: socket.id,
        fromUserId: socket.userId,
        sessionId
      });
    });

    // Legacy support for old events (backward compatibility)
    socket.on('offer', (data) => {
      console.log(`📤 [Legacy] Relaying offer from ${socket.userName}`);
      socket.to(`video-${data.sessionId}`).emit('offer', {
        ...data,
        fromUserId: socket.userId,
        fromUserName: socket.userName,
        fromSocketId: socket.id
      });
    });

    socket.on('answer', (data) => {
      console.log(`📤 [Legacy] Relaying answer from ${socket.userName}`);
      socket.to(`video-${data.sessionId}`).emit('answer', {
        ...data,
        fromUserId: socket.userId,
        fromUserName: socket.userName,
        fromSocketId: socket.id
      });
    });

    socket.on('ice-candidate', (data) => {
      console.log(`🧊 [Legacy] Relaying ICE candidate from ${socket.userName}`);
      socket.to(`video-${data.sessionId}`).emit('ice-candidate', {
        ...data,
        fromSocketId: socket.id
      });
    });

    // Video chat message
    socket.on('video-chat-message', (data) => {
      console.log(`💬 Video chat message from ${socket.userName}`);
      socket.to(`video-${data.sessionId}`).emit('video-chat-message', data);
    });

    // Leave video room
    socket.on('leave-video-room', (sessionId) => {
      const roomName = `video-${sessionId}`;
      console.log(`👋 User ${socket.userName} leaving room ${roomName}`);
      
      socket.to(roomName).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName,
        socketId: socket.id
      });
      
      socket.leave(roomName);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id, socket.userName || 'Unknown');
      
      // Notify the video room about disconnection
      if (socket.sessionId && socket.roomName) {
        socket.to(socket.roomName).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName,
          socketId: socket.id
        });
        console.log(`📤 Notified room ${socket.roomName} about ${socket.userName} disconnecting`);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', socket.id, error);
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