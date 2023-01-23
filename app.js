const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

// routes
const authRouter = require('./routes/authRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));

//middleware to get request body
app.use(express.json());

//routes
// mounting routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

//route not found
app.all('*', (req, res, next) => {
  next(new AppError('Route not found', 404));
});

//error handling middleware
app.use(errorHandler);

module.exports = app;
