const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer'); // for multipart uploads
const sharp = require('sharp'); // for resizing images

const User = require('../models/userModel');
const catchAync = require('../utils/catchAync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

/* const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/img/users');
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split('/')[1];
    callback(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
}); */

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(new AppError('Please upload an image', 422), false);
  }
};

// path to store the image
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const getSignedToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  secure: true,
  httpOnly: true,
};

if (process.env.NODE_ENV === 'production') {
  cookieOptions.secure = false;
}

const filterObj = (obj, fields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.uploadUserPhoto = upload.single('photo');

// image resizing
exports.resizeUserPhoto = catchAync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.signup = catchAync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  user.password = undefined;
  res.cookie('jwt', getSignedToken(user._id), cookieOptions);
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
  user.password = undefined;
  res.cookie('jwt', getSignedToken(user._id), cookieOptions);
  res.status(200).json({
    success: true,
    data: {
      user: user,
      access_token: getSignedToken(user._id),
    },
  });
});

exports.getAuthUser = catchAync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

exports.updateAuthUser = catchAync(async (req, res, next) => {
  // remove passwords from body
  delete req.body.password;
  delete req.body.passwordConfirm;

  const updateData = filterObj(req.body, ['name', 'email']);

  // add file name to data
  if (req.file) updateData.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: {
      user: user,
    },
  });
});

exports.deleteAuthUSer = catchAync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    success: true,
    message: 'user deleted',
  });
});

exports.forgotPassword = catchAync(async (req, res, next) => {
  // get user based on email
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // generate a random token
  const token = user.createPasswordResetToken();

  // save the user data with the new password reset token
  await user.save({ validateBeforeSave: false });
  //send it back to users email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/reset-password/${token}`;

  const message = `Forgot password!. Please submit a patch request with your new password to this url ${resetURL}. \n if you didnt submit this request forget email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email not sent! try again later', 500));
  }
});

exports.resetPassword = catchAync(async (req, res, next) => {
  // get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    next(new AppError('Token is invalid', 400));
  }

  //set new password if user exist and token has not expired
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful. Login with new password',
  });
});

exports.changePassword = catchAync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;
  // get user
  const user = await User.findById(req.user._id).select('+password');

  //check if password is correct
  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('User password is incorrect', 401));
  }
  // insert the new password
  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

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

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
