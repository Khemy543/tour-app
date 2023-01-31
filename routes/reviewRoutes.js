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

router.use(protectRoute);

router.route('/').post(restrictTo('user'), createReview).get(getReviews);

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview);

module.exports = router;
