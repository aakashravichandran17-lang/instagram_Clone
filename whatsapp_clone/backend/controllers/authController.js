const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { username, fullName, email, password, profileImage } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists.'
      });
    }

    const user = await User.create({
      username,
      fullName,
      email,
      password,
      profileImage: profileImage || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to ConnectHub!',
      data: { token, user: user.toPublicJSON() }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: { token, user: user.toPublicJSON() }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { user: req.user.toPublicJSON() }
    });
  } catch (error) {
    next(error);
  }
};
