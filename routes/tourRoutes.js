const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
} = require('../controllers/tourController');
const { protectRoute } = require('../controllers/authController');

const router = express.Router();

router.route('/tour-stats').get(getTourStats);

router.route('/').get(protectRoute, getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
