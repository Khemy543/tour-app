const Review = require('../models/reviewModel');
const catchAync = require('../utils/catchAync');
const {
  deleteResource,
  updateResource,
  getResouceById,
} = require('./handlerFactoryController');

exports.createReview = catchAync(async (req, res, next) => {
  const review = await Review.create({
    ...req.body,
    user: req.user.id,
    tour: req.params.tour,
  });

  res.status(201).json({
    success: true,
    data: {
      review,
    },
  });
});

exports.getReviews = catchAync(async (req, res, next) => {
  let filter = {};

  if (req.params.tour) filter = { tour: req.params.tour };
  const reviews = await Review.find(filter);

  res.status(200).json({
    success: true,
    data: {
      reviews,
    },
  });
});

exports.getReview = getResouceById(Review);

exports.updateReview = updateResource(Review);

exports.deleteReview = deleteResource(Review);
