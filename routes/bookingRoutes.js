const express = require('express');
const { protectRoute, restrictTo } = require('../controllers/authController');
const {
  getCheckoutSession,
  getBookedTours,
  createBooking,
  getBooking,
  deleteBooking,
  updateBooking,
  getAllBookings,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(protectRoute);

router.get('/checkout-session/:tour', getCheckoutSession);

router.get('/my-tours', getBookedTours);

router.use(restrictTo('admin'));

router.route('/').post(createBooking).get(getAllBookings);

router.route('/:id').get(getBooking).delete(deleteBooking).patch(updateBooking);

module.exports = router;
