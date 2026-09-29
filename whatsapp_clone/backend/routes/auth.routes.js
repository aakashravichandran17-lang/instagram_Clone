const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../middleware/validate');

router.post('/register', validate(registerRules), authController.register);
router.post('/login', validate(loginRules), authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
