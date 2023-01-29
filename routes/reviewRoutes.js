const express = require('express');
const {
  getReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
} = require('../controllers/reviewController');
const { protectRoute, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protectRoute, restrictTo('user'), createReview)
  .get(protectRoute, getReviews);

router
  .route('/:id')
  .delete(protectRoute, deleteReview)
  .patch(protectRoute, updateReview)
  .get(protectRoute, getReview);

module.exports = router;
