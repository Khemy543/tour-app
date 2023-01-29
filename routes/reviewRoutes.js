const express = require('express');
const { getReviews, createReview } = require('../controllers/reviewController');
const { protectRoute, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protectRoute, restrictTo('user'), createReview)
  .get(protectRoute, getReviews);

module.exports = router;
