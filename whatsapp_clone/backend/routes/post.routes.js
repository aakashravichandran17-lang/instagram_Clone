const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const {
  validate,
  createPostRules,
  updatePostRules,
  postIdRules,
  createCommentRules
} = require('../middleware/validate');

router.get('/feed', auth, postController.getFeed);
router.get('/', auth, postController.getAllPosts);
router.post('/', auth, validate(createPostRules), postController.createPost);
router.get('/:id', auth, validate(postIdRules), postController.getPostById);
router.put('/:id', auth, validate(updatePostRules), postController.updatePost);
router.delete('/:id', auth, validate(postIdRules), postController.deletePost);
router.post('/:id/like', auth, validate(postIdRules), postController.likePost);
router.delete('/:id/like', auth, validate(postIdRules), postController.unlikePost);
router.post('/:id/comments', auth, validate(createCommentRules), commentController.addComment);

module.exports = router;
