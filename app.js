const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

// routes
const authRouter = require('./routes/authRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.enable('trust-proxy');

// implementing CORS

app.use(cors());

/* app.use(
  cors({
    origin: process.env.APP_URL,
  })
); */

app.options('*', cors());

//middlewares

// Set security http
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// do not allow more than 100 request for the same IP in an hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'Too many request from this IP please try again in an hour',
});

app.use('/api', limiter);

app.use(express.static(`${__dirname}/public`));

//middleware to get request body
app.use(express.json({ limit: '10kb' })); // limiting the size of the request body to 10KB

//Data sanitization against malicious query injection
app.use(mongoSantize());

//Data sanitizatin against XSS attacks
app.use(xss());

// prevent query parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// copmression of our text repsonse
app.use(compression);

//routes
// mounting routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//route not found
app.all('*', (req, res, next) => {
  next(new AppError('Route not found', 404));
});

//error handling middleware
app.use(errorHandler);

module.exports = app;
