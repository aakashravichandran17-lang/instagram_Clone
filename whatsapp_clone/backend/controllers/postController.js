const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const socketService = require('../services/socket.service');

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 */
exports.createPost = async (req, res, next) => {
  try {
    const { content, image } = req.body;

    const post = await Post.create({
      author: req.user._id,
      content,
      image: image || ''
    });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'username fullName profileImage'
    );

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: populatedPost }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get feed (own posts + posts from followed users)
 * @route   GET /api/posts/feed
 */
exports.getFeed = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const feedUserIds = [...currentUser.following, req.user._id];

    const posts = await Post.find({ author: { $in: feedUserIds } })
      .populate('author', 'username fullName profileImage')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username fullName profileImage' }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all posts (explore)
 * @route   GET /api/posts
 */
exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username fullName profileImage')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username fullName profileImage' }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single post
 * @route   GET /api/posts/:id
 */
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName profileImage')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username fullName profileImage' }
      });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a post (author only)
 * @route   PUT /api/posts/:id
 */
exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts.'
      });
    }

    const { content, image } = req.body;
    post.content = content || post.content;
    if (image !== undefined) post.image = image;
    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      'author',
      'username fullName profileImage'
    );

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a post (author only)
 * @route   DELETE /api/posts/:id
 */
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts.'
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Like a post
 * @route   POST /api/posts/:id/like
 */
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const alreadyLiked = post.likes.some(
      (l) => l.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: 'You already liked this post.'
      });
    }

    post.likes.push(req.user._id);
    await post.save();

    // Notify post author (but not if liking your own post)
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        message: 'liked your post',
        relatedId: post._id
      });
      socketService.emitToUser(post.author, 'newNotification', notification);
    }

    res.json({
      success: true,
      message: 'Post liked',
      data: { likesCount: post.likes.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unlike a post
 * @route   DELETE /api/posts/:id/like
 */
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.likes = post.likes.filter(
      (l) => l.toString() !== req.user._id.toString()
    );
    await post.save();

    res.json({
      success: true,
      message: 'Post unliked',
      data: { likesCount: post.likes.length }
    });
  } catch (error) {
    next(error);
  }
};
