const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation is required']
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required']
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);
