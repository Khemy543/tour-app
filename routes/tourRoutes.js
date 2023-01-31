const express = require('express');
const reviewRouter = require('./reviewRoutes');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getToursWithIn,
  getTourDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourController');
const { protectRoute, restrictTo } = require('../controllers/authController');

const router = express.Router();

//nested routes, tours and reviews
router.use('/:tour/reviews', reviewRouter);

router.get(
  '/tour-stats',
  protectRoute,
  restrictTo('admin', 'lead-guide', 'guide'),
  getTourStats
);

router.get('/distances/:latlng/unit/:unit', getTourDistances);

router.get('/tours-within/:distance/center/:latlng/unit/:unit', getToursWithIn);

router
  .route('/')
  .get(getAllTours)
  .post(protectRoute, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protectRoute,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protectRoute, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
