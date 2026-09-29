const User = require('../models/User');
const Post = require('../models/Post');
const socketService = require('../services/socket.service');
const Notification = require('../models/Notification');

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const postsCount = await Post.countDocuments({ author: user._id });

    res.json({
      success: true,
      data: { user: { ...user.toPublicJSON(), postsCount } }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by username
 * @route   GET /api/users/username/:username
 */
exports.getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const postsCount = await Post.countDocuments({ author: user._id });
    const isFollowing = req.user
      ? user.followers.some((f) => f.toString() === req.user._id.toString())
      : false;

    res.json({
      success: true,
      data: { user: { ...user.toPublicJSON(), postsCount, isFollowing } }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update own profile
 * @route   PUT /api/users/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, bio, profileImage },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toPublicJSON() }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Follow a user
 * @route   POST /api/users/:id/follow
 */
exports.followUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;

    if (targetId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.'
      });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const alreadyFollowing = targetUser.followers.some(
      (f) => f.toString() === currentUserId.toString()
    );

    if (alreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user.'
      });
    }

    // Add to target's followers and current user's following
    targetUser.followers.push(currentUserId);
    await targetUser.save();

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetId }
    });

    // Create notification
    const notification = await Notification.create({
      recipient: targetId,
      sender: currentUserId,
      type: 'follow',
      message: 'started following you',
      relatedId: currentUserId
    });

    socketService.emitToUser(targetId, 'newNotification', notification);

    res.json({
      success: true,
      message: `You are now following ${targetUser.username}`,
      data: { followersCount: targetUser.followers.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/users/:id/follow
 */
exports.unfollowUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    targetUser.followers = targetUser.followers.filter(
      (f) => f.toString() !== currentUserId.toString()
    );
    await targetUser.save();

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetId }
    });

    res.json({
      success: true,
      message: `You unfollowed ${targetUser.username}`,
      data: { followersCount: targetUser.followers.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a user's followers
 * @route   GET /api/users/:id/followers
 */
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'followers',
      'username fullName profileImage'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: { followers: user.followers }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a user's following
 * @route   GET /api/users/:id/following
 */
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'following',
      'username fullName profileImage'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: { following: user.following }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get suggested users to follow
 * @route   GET /api/users/suggestions
 */
exports.getSuggestedUsers = async (req, res, next) => {
  try {
    const suggestions = await User.find({
      _id: { $ne: req.user._id, $nin: req.user.following }
    })
      .select('username fullName profileImage bio')
      .limit(10);

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search users by username or full name
 * @route   GET /api/users/search?q=
 */
exports.searchUsers = async (req, res, next) => {
  try {
    const searchQuery = req.query.q;

    const users = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { fullName: { $regex: searchQuery, $options: 'i' } }
      ],
      _id: { $ne: req.user._id }
    })
      .select('username fullName profileImage bio')
      .limit(20);

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};
