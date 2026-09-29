const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const { validate, createConversationRules } = require('../middleware/validate');

router.get('/conversations', auth, chatController.getConversations);
router.post(
  '/conversations',
  auth,
  validate(createConversationRules),
  chatController.createConversation
);
router.get('/conversations/:id/messages', auth, chatController.getMessages);
router.put('/conversations/:id/read', auth, chatController.markAsRead);
router.get('/unread-count', auth, chatController.getUnreadCount);

module.exports = router;
