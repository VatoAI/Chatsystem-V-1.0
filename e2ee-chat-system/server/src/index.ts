import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { User, Message, SocketEvents } from './shared/types';
import { DatabaseManager } from './database/DatabaseManager';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer<SocketEvents>(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for active users (in production, use Redis)
const activeUsers = new Map<string, User>();

// Database initialization
const db = new DatabaseManager();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user:join', async (userData) => {
    try {
      const user: User = {
        id: socket.id,
        username: userData.username,
        publicKey: userData.publicKey,
        isOnline: true,
        lastSeen: new Date()
      };

      // Store user in database and active users
      await db.createUser(user);
      activeUsers.set(socket.id, user);

      // Notify all clients about new user
      socket.broadcast.emit('user:joined', user);
      
      // Send current online users to the new user
      const onlineUsers = Array.from(activeUsers.values());
      socket.emit('users:online', onlineUsers);

      console.log(`User ${userData.username} joined`);
    } catch (error) {
      console.error('Error handling user join:', error);
    }
  });

  // Handle message sending
  socket.on('message:send', async (messageData) => {
    try {
      const message: Message = {
        id: uuidv4(),
        senderId: socket.id,
        receiverId: messageData.receiverId,
        encryptedContent: messageData.encryptedContent,
        timestamp: new Date(),
        messageType: messageData.messageType
      };

      // Store message in database
      await db.saveMessage(message);

      // Send message to recipient if online
      const recipientSocket = io.sockets.sockets.get(messageData.receiverId);
      if (recipientSocket) {
        recipientSocket.emit('message:received', message);
      }

      console.log(`Message sent from ${socket.id} to ${messageData.receiverId}`);
    } catch (error) {
      console.error('Error handling message send:', error);
    }
  });

  // Handle typing indicators
  socket.on('user:typing', (data) => {
    const recipientSocket = io.sockets.sockets.get(data.receiverId);
    if (recipientSocket) {
      recipientSocket.emit('user:typing:update', {
        senderId: socket.id,
        isTyping: data.isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const user = activeUsers.get(socket.id);
      if (user) {
        // Update user offline status
        user.isOnline = false;
        user.lastSeen = new Date();
        await db.updateUserStatus(user);
        
        // Remove from active users
        activeUsers.delete(socket.id);
        
        // Notify other users
        socket.broadcast.emit('user:left', socket.id);
        
        console.log(`User ${user.username} disconnected`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get user's message history
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await db.getUserMessages(userId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 E2EE Chat Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
  console.log(`🗄️  Database initialized`);
});

export default app;
