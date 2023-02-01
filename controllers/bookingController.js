const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAync = require('../utils/catchAync');
const {
  createResource,
  getResouceById,
  deleteResource,
  updateResource,
  getAllResouces,
} = require('./handlerFactoryController');

exports.getCheckoutSession = catchAync(async (req, res, next) => {
  // get currenlty booked tour
  const tour = await Tour.findById(req.params.tour);
  //get checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `https://success.com/?tour=${tour._id}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: 'https://fail.com',
    mode: 'payment',
    customer_email: req.user.email,
    client_reference_id: req.params.tour,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [],
          },
        },
        quantity: 1,
      },
    ],
  });
  // create session response
  res.status(200).json({
    success: true,
    data: {
      session,
    },
  });
});

exports.createBookingCheckout = catchAync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) {
    return next(new AppError('Could not create booking', 422));
  }
  await Booking.create({ tour, user, price });

  next();
});

exports.getBookedTours = catchAync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id });

  const tourIds = bookings.map((booking) => booking.tour.id);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).json({
    success: true,
    data: {
      tours,
    },
  });
});

exports.createBooking = createResource(Booking);

exports.getBooking = getResouceById(Booking);

exports.deleteBooking = deleteResource(Booking);

exports.updateBooking = updateResource(Booking);

exports.getAllBookings = getAllResouces(Booking);
