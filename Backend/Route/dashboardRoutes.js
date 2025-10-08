const express = require('express');
const auth = require('../Auth/middleware');
const dashboardController = require('../Controller/dashboardController');

const router = express.Router();

// Get dashboard stats
router.get('/stats', auth, dashboardController.getStats);

// Get recent activity
router.get('/activity', auth, dashboardController.getActivity);

// Get upcoming sessions
router.get('/upcoming-sessions', auth, dashboardController.getUpcomingSessions);

module.exports = router;