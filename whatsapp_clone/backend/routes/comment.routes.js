const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const { validate, postIdRules } = require('../middleware/validate');

router.delete('/:id', auth, validate(postIdRules), commentController.deleteComment);

module.exports = router;
