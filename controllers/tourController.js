const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAync');
const {
  deleteResource,
  updateResource,
  createResource,
  getResouceById,
  getAllResouces,
} = require('./handlerFactoryController');

exports.getTour = getResouceById(Tour, {
  path: 'reviews',
  select: 'review rating user',
});

exports.getAllTours = getAllResouces(Tour);

exports.createTour = createResource(Tour);

exports.updateTour = updateResource(Tour);

exports.deleteTour = deleteResource(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numRating: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $min: '$price' },
      },
    },
    {
      $sort: { avgRating: -1 },
    },
    {
      $match: { _id: { $ne: 'easy' } },
    },
  ]);
  res.status(200).json({
    success: true,
    data: stats,
  });
});
