const express = require('express');
const auth = require('../Auth/middleware');
const userController = require('../Controller/userController');

const router = express.Router();

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, userController.updateProfile);

// Get user stats
router.get('/stats', auth, userController.getStats);

module.exports = router;