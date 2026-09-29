const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.post('/image', auth, uploadImage, uploadController.uploadImage);

module.exports = router;
