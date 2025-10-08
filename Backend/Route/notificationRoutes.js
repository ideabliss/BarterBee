const express = require('express');
const auth = require('../Auth/middleware');
const notificationController = require('../Controller/notificationController');

const router = express.Router();

// Get user notifications
router.get('/', auth, notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', auth, notificationController.markAllAsRead);

// Get unread count
router.get('/unread/count', auth, notificationController.getUnreadCount);

module.exports = router;