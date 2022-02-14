const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const { verifyAccessToken } = require('../utils/token-utils');

const isAuth = catchAsync(async (req, res, next) => {
  if (!req.cookies['access'])
    return res.status(401).json({
      status: 'unauthorized',
      message: 'You are not logged in! Please log in to get access.'
    });

  const token = verifyAccessToken(req.cookies['access']);

  const currentUser = await User.findById(token.userId);

  if (!currentUser) {
    return res.status(401).json({
      status: 'unauthorized',
      message: 'The user belonging to this token does no longer exist.'
    });
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

module.exports = isAuth;
