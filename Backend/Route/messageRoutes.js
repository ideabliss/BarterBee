const express = require('express');
const auth = require('../Auth/middleware');
const messageController = require('../Controller/messageController');

const router = express.Router();

// Get messages for a barter request
router.get('/:barter_request_id', auth, messageController.getMessages);

// Send message
router.post('/', auth, messageController.sendMessage);

// Get unread message count
router.get('/unread/count', auth, messageController.getUnreadCount);

module.exports = router;