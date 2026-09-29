const path = require('path');
const fs = require('fs');
const {
  isValidImageBuffer,
  UPLOAD_DIR
} = require('../middleware/upload');

/**
 * @desc    Upload an image file
 * @route   POST /api/upload/image
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.'
      });
    }

    // Validate the actual file content (magic bytes) before saving
    if (!isValidImageBuffer(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image file. The file content is not a valid image.'
      });
    }

    // Generate a safe, unique filename (never trust the original name)
    const extension = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp'
    }[req.file.mimetype];

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, req.file.buffer);

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { imageUrl, filename }
    });
  } catch (error) {
    next(error);
  }
};
