const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required']
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required']
    },
    type: {
      type: String,
      enum: ['follow', 'like', 'comment', 'message'],
      required: [true, 'Notification type is required']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required']
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
