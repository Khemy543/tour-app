const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAync = require('../utils/catchAync');
const {
  createResource,
  getResouceById,
  deleteResource,
  updateResource,
  getAllResouces,
} = require('./handlerFactoryController');
const User = require('../models/userModel');

exports.getCheckoutSession = catchAync(async (req, res, next) => {
  // get currenlty booked tour
  const tour = await Tour.findById(req.params.tour);
  //get checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `https://success.com`,
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

/* exports.createBookingCheckout = catchAync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) {
    return next(new AppError('Could not create booking', 422));
  }
  await Booking.create({ tour, user, price });

  next();
}); */

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].price_data.unit_amount / 100;
  await Booking.create({ tour, user, price });
};

exports.createWebhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    res.status(400).send(`Webhook Error ${error}`);
  }

  if (event.type === 'checkout.session.complete')
    createBookingCheckout(event.data.object);

  res.status(200).send({ received: true });
};

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
