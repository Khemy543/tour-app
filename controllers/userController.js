const User = require('../models/userModel');
const catchAync = require('../utils/catchAync');

exports.getAllUsers = catchAync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    data: {
      users,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
