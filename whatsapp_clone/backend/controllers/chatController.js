const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * @desc    Get all conversations for the current user
 * @route   GET /api/chat/conversations
 */
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'username fullName profileImage')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username fullName profileImage' }
      })
      .sort({ updatedAt: -1 });

    // Shape the response: include the "other" participant and unread count
    const shaped = await Promise.all(
      conversations.map(async (conv) => {
        const other = conv.participants.find(
          (p) => p._id.toString() !== req.user._id.toString()
        );
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: req.user._id,
          isRead: false
        });
        return {
          id: conv._id,
          participant: other,
          lastMessage: conv.lastMessage,
          unreadCount,
          updatedAt: conv.updatedAt
        };
      })
    );

    res.json({
      success: true,
      data: { conversations: shaped }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get or create a one-to-one conversation
 * @route   POST /api/chat/conversations
 */
exports.createConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;

    if (participantId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself.'
      });
    }

    const otherUser = await User.findById(participantId);
    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Look for an existing conversation between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] }
    }).populate('participants', 'username fullName profileImage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId]
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'username fullName profileImage'
      );
    }

    res.status(201).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get messages in a conversation
 * @route   GET /api/chat/conversations/:id/messages
 */
exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Ensure the current user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation.'
      });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'username fullName profileImage')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all messages in a conversation as read
 * @route   PUT /api/chat/conversations/:id/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    await Message.updateMany(
      { conversation: conversation._id, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get total unread message count
 * @route   GET /api/chat/unread-count
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    next(error);
  }
};
