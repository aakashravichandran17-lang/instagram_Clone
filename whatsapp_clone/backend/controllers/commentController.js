const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const socketService = require('../services/socket.service');

/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/:id/comments
 */
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      content: req.body.content
    });

    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'username fullName profileImage'
    );

    // Notify post author (but not if commenting on your own post)
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        message: 'commented on your post',
        relatedId: post._id
      });
      socketService.emitToUser(post.author, 'newNotification', notification);
    }

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: { comment: populatedComment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment (comment author only)
 * @route   DELETE /api/comments/:id
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments.'
      });
    }

    // Remove comment reference from the post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (error) {
    next(error);
  }
};
