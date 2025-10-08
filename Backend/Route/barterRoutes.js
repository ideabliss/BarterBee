const express = require('express');
const barterController = require('../Controller/barterController');
const auth = require('../Auth/middleware');

const router = express.Router();

// Create barter request
router.post('/', auth, barterController.createRequest);
router.post('/request', auth, barterController.createRequest);

// Get user's barter requests
router.get('/requests', auth, barterController.getRequests);

// Update barter request status
router.put('/:id/status', auth, barterController.updateRequestStatus);
router.put('/requests/:id', auth, barterController.updateRequestStatus);

// Get user activity
router.get('/activity', auth, barterController.getActivity);

module.exports = router;