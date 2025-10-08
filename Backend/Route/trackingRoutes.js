const express = require('express');
const auth = require('../Auth/middleware');
const trackingController = require('../Controller/trackingController');

const router = express.Router();

// Create tracking info
router.post('/', auth, trackingController.createTracking);

// Get tracking info
router.get('/:barter_request_id', auth, trackingController.getTracking);

// Update tracking status
router.put('/:id/status', auth, trackingController.updateTrackingStatus);

// Get tracking timeline
router.get('/:barter_request_id/timeline', auth, trackingController.getTrackingTimeline);

module.exports = router;