const express = require('express');
const authController = require('../Controller/authController');
const auth = require('../Auth/middleware');

const router = express.Router();

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Change password (authenticated)
router.post('/change-password', auth, authController.changePassword);

module.exports = router;