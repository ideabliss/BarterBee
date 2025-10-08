const express = require('express');
const auth = require('../Auth/middleware');
const reviewController = require('../Controller/reviewController');

const router = express.Router();

// Create review
router.post('/', auth, reviewController.createReview);

// Get reviews for a user
router.get('/user/:user_id', reviewController.getUserReviews);

// Get review for specific barter request
router.get('/barter/:barter_request_id', auth, reviewController.getBarterReview);

module.exports = router;