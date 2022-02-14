const catchAsync = require('./../utils/catchAsync');

const User = require('./../models/userModel');

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    res.status(404).json({
      status: 'Not Found',
      message: 'No user found with that ID'
    });
  }

  res.status(200).json(user);
});
