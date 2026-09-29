const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware that runs express-validator checks and returns a 400
 * with the first error message if validation fails.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  };
};

// ---- Auth validators ----
const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 50 })
    .withMessage('Full name cannot exceed 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// ---- Post validators ----
const createPostRules = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 2000 })
    .withMessage('Post cannot exceed 2000 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL')
];

const updatePostRules = [
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Post content cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Post cannot exceed 2000 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL')
];

const postIdRules = [param('id').isMongoId().withMessage('Invalid post ID')];

// ---- Comment validators ----
const createCommentRules = [
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// ---- User validators ----
const updateProfileRules = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Full name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Bio cannot exceed 160 characters'),
  body('profileImage')
    .optional()
    .isURL()
    .withMessage('Profile image must be a valid URL')
];

const userIdRules = [param('id').isMongoId().withMessage('Invalid user ID')];

// ---- Chat validators ----
const createConversationRules = [
  body('participantId')
    .isMongoId()
    .withMessage('Invalid participant ID')
];

const messageRules = [
  body('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters')
];

// ---- Search validator ----
const searchRules = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be 1-50 characters')
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  createPostRules,
  updatePostRules,
  postIdRules,
  createCommentRules,
  updateProfileRules,
  userIdRules,
  createConversationRules,
  messageRules,
  searchRules
};
