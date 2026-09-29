const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const { validate, postIdRules } = require('../middleware/validate');

router.get('/', auth, notificationController.getNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/read-all', auth, notificationController.markAllAsRead);
router.put('/:id/read', auth, validate(postIdRules), notificationController.markAsRead);

module.exports = router;
