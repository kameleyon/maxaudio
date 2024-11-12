const express = require('express');
const router = express.Router();

// Mock auth endpoints for development
router.post('/login', (req, res) => {
  res.json({
    token: 'mock_token',
    user: {
      id: '123',
      email: 'test@example.com',
      role: 'user'
    }
  });
});

router.post('/register', (req, res) => {
  res.json({
    token: 'mock_token',
    user: {
      id: '123',
      email: req.body.email,
      role: 'user'
    }
  });
});

router.get('/me', (req, res) => {
  res.json({
    id: '123',
    email: 'test@example.com',
    role: 'user'
  });
});

router.post('/logout', (req, res) => {
  res.status(200).send();
});

module.exports = router;
