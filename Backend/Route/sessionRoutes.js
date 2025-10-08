const express = require('express');
const sessionController = require('../Controller/sessionController');
const auth = require('../Auth/middleware');

const router = express.Router();

// Create session
router.post('/', auth, sessionController.createSession);

// Schedule session
router.post('/schedule', auth, sessionController.scheduleSession);

// Get user's sessions
router.get('/', auth, sessionController.getUserSessions);

// Update session
router.put('/:id', auth, sessionController.updateSession);

// Update session status
router.put('/:id/status', auth, sessionController.updateSessionStatus);

// Reschedule session
router.put('/:id/reschedule', auth, sessionController.rescheduleSession);

// Join session
router.get('/:id/join', auth, sessionController.joinSession);

// Get session history
router.get('/history/:barter_request_id', auth, sessionController.getSessionHistory);

// Complete session
router.put('/:id/complete', auth, sessionController.completeSession);

module.exports = router;