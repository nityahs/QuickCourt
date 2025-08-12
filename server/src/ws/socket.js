import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let _io;

export const initSocket = (httpServer) => {
  _io = new Server(httpServer, { 
    cors: { 
      origin: [process.env.CLIENT_ORIGIN, 'http://localhost:5173'],
      credentials: true
    }
  });

  // Socket.io middleware for authentication
  _io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  _io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id, 'User:', socket.user?._id);
    
    // Join user-specific room for targeted messages
    if (socket.user?._id) {
      socket.join(`user:${socket.user._id}`);
      
      // Join role-specific room
      if (socket.user.role) {
        socket.join(`role:${socket.user.role}`);
      }
    }
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
export const io = () => _io;