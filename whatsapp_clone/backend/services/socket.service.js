const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

let io = null;
// Map<userId, Set<socketId>> — tracks online users
const onlineUsers = new Map();

/**
 * Initialize Socket.io with authentication and event handlers.
 */
const initialize = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:4200',
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    io.emit('userOnline', { userId });

    // Join a conversation room
    socket.on('joinRoom', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('leaveRoom', (conversationId) => {
      socket.leave(conversationId);
    });

    // Send a message
    socket.on('sendMessage', async (data, callback) => {
      try {
        const { conversationId, message } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return callback?.({ success: false, message: 'Conversation not found' });
        }

        const receiverId = conversation.participants.find(
          (p) => p.toString() !== userId
        );

        const newMessage = await Message.create({
          conversation: conversationId,
          sender: userId,
          receiver: receiverId,
          message
        });

        conversation.lastMessage = newMessage._id;
        conversation.updatedAt = new Date();
        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id).populate(
          'sender',
          'username fullName profileImage'
        );

        // Emit to everyone in the conversation room
        io.to(conversationId).emit('receiveMessage', populatedMessage);

        // Notify the receiver for their conversation list
        emitToUser(receiverId, 'newMessage', populatedMessage);

        // Create a notification
        const notification = await Notification.create({
          recipient: receiverId,
          sender: userId,
          type: 'message',
          message: 'sent you a message',
          relatedId: newMessage._id
        });
        emitToUser(receiverId, 'newNotification', notification);

        callback?.({ success: true, data: populatedMessage });
      } catch (error) {
        console.error('sendMessage error:', error.message);
        callback?.({ success: false, message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('userTyping', {
        conversationId: data.conversationId,
        userId
      });
    });

    socket.on('stopTyping', (data) => {
      socket.to(data.conversationId).emit('userStoppedTyping', {
        conversationId: data.conversationId,
        userId
      });
    });

    // Mark messages as read
    socket.on('messageRead', async (data) => {
      try {
        const { conversationId } = data;
        await Message.updateMany(
          { conversation: conversationId, receiver: userId, isRead: false },
          { isRead: true, readAt: new Date() }
        );
        io.to(conversationId).emit('messagesRead', { conversationId, userId });
      } catch (error) {
        console.error('messageRead error:', error.message);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('userOffline', { userId });
        }
      }
    });
  });

  console.log('🔌 Socket.io initialized');
};

/**
 * Emit an event to all sockets of a specific user.
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    sockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};

/**
 * Check if a user is currently online.
 */
const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

/**
 * Get all online user IDs.
 */
const getOnlineUserIds = () => {
  return Array.from(onlineUsers.keys());
};

module.exports = { initialize, emitToUser, isUserOnline, getOnlineUserIds };
