const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

/**
 * Validates the actual binary content of the file via magic bytes.
 * Never trusts the filename extension or the client-provided MIME type alone.
 */
const isValidImageBuffer = (buffer, mimetype) => {
  if (!buffer || buffer.length < 12) return false;

  const startsWith = (bytes) =>
    bytes.every((byte, i) => buffer[i] === byte);

  switch (mimetype) {
    case 'image/jpeg':
      // FF D8 FF
      return startsWith([0xff, 0xd8, 0xff]);

    case 'image/png':
      // 89 50 4E 47 0D 0A 1A 0A
      return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    case 'image/gif':
      // GIF87a or GIF89a
      return (
        startsWith([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
        startsWith([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
      );

    case 'image/webp':
      // RIFF (52 49 46 46) at offset 0, "WEBP" (57 45 42 50) at offset 8
      return (
        startsWith([0x52, 0x49, 0x46, 0x46]) &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      );

    default:
      return false;
  }
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error('Only image files (JPG, PNG, GIF, WEBP) are allowed.')
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

/**
 * Multer middleware for a single image field named "image".
 * Catches multer-specific errors (e.g. file too large) and
 * returns a consistent JSON error response.
 */
const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image file is too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed.'
      });
    }
    next();
  });
};

module.exports = {
  uploadImage,
  isValidImageBuffer,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES
};
