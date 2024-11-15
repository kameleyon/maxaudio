const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user.model');
const { requireAuth } = require('../middleware/auth');
const emailService = require('../services/email.service');

// Cookie options for JWT
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Generate tokens
const generateTokens = (userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, version: 1 }, // version for token invalidation
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, refreshToken };
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, name } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    user = new User({
      email,
      password,
      username,
      name,
      isVerified: false
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(email);

    // Generate tokens
    const { token, refreshToken } = generateTokens(user._id);

    // Set refresh token in http-only cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    // Verify token
    const decoded = emailService.verifyToken(token, 'email_verification');
    
    // Update user
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ error: 'Invalid or expired verification token' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send password reset email
    await emailService.sendPasswordResetEmail(email);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Verify token
    const decoded = emailService.verifyToken(token, 'password_reset');
    
    // Update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({ error: 'Invalid or expired reset token' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(user._id);

    // Set refresh token in http-only cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Set new refresh token in http-only cookie
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    res.json({ token: tokens.token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json({ available: !user });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check email availability
router.get('/check-email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.json({ available: !user });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
