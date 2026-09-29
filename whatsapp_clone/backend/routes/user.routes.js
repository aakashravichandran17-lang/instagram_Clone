const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const {
  validate,
  updateProfileRules,
  userIdRules,
  searchRules
} = require('../middleware/validate');

router.get('/search', auth, validate(searchRules), userController.searchUsers);
router.get('/suggestions', auth, userController.getSuggestedUsers);
router.get('/username/:username', auth, userController.getUserByUsername);
router.get('/:id', auth, validate(userIdRules), userController.getUserById);
router.put('/profile', auth, validate(updateProfileRules), userController.updateProfile);
router.post('/:id/follow', auth, validate(userIdRules), userController.followUser);
router.delete('/:id/follow', auth, validate(userIdRules), userController.unfollowUser);
router.get('/:id/followers', auth, validate(userIdRules), userController.getFollowers);
router.get('/:id/following', auth, validate(userIdRules), userController.getFollowing);

module.exports = router;
