const express = require('express');
const auth = require('../Auth/middleware');
const pollController = require('../Controller/pollController');

const router = express.Router();

// Get all polls (for voting) - optional auth to check if user voted
router.get('/', (req, res, next) => {
  // Try to authenticate but don't require it
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    } catch (error) {
      // Ignore auth errors for public polls
    }
  }
  next();
}, pollController.getAllPolls);

// Get user's polls
router.get('/my-polls', auth, pollController.getUserPolls);

// Create new poll
router.post('/', auth, pollController.createPoll);

// Vote on poll
router.post('/:id/vote', auth, pollController.voteOnPoll);

module.exports = router;