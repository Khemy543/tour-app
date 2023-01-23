const User = require('../models/userModal');
const catchAync = require('../utils/catchAync');

exports.signup = catchAync(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: {
      user,
    },
  });
});
