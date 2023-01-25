const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModal');
const catchAync = require('../utils/catchAync');
const AppError = require('../utils/appError');

const getSignedToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

exports.signup = catchAync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      access_token: getSignedToken(user._id),
    },
  });
});

exports.login = catchAync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 422));
  }
  //check if user exist
  const user = await User.findOne({ email }).select('+password');

  //check if password is correct
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //send response
  res.status(200).json({
    success: true,
    data: {
      user: user,
      access_token: getSignedToken(user._id),
    },
  });
});

exports.protectRoute = catchAync(async (req, res, next) => {
  // get token and check if it is available
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('User not logged in', 401));
  }
  //verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exist
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('user does not exist', 401));
  }
  // check user changed password after jwt was issued
  if (user.changePasswordAfter(decoded.iat)) {
    return next(new AppError('user password changed, please login again', 401));
  }

  //place user on the request data
  req.user = user;
  next();
});
