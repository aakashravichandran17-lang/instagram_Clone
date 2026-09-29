const Notification = require('../models/Notification');

/**
 * @desc    Get notifications for the current user
 * @route   GET /api/notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username fullName profileImage')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
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
