const catchAsync = require('./../utils/catchAsync');
const {
  buildTokens,
  setTokens,
  verifyRefreshToken,
  refreshTokens,
  clearTokens
} = require('./../utils/token-utils');
const User = require('./../models/userModel');

const createSendToken = (user, statusCode, req, res) => {
  user.password = undefined;

  const { accessToken, refreshToken } = buildTokens(user);
  setTokens(res, accessToken, refreshToken);

  res.status(statusCode).json(user);
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser)
    res.status(400).json({
      message: `User on ${email} already exists.`
    });

  const newUser = await User.create({ name, email, password });

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: 'Unauthorized',
      message: 'Please provide email and password!'
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: 'Bad Request',
      message: 'Incorrect email or password'
    });
  }

  createSendToken(user, 200, req, res);
});

exports.tokenRefresh = catchAsync(async (req, res) => {
  try {
    const current = verifyRefreshToken(req.cookies['refresh']);
    const user = await User.findById(current.userId);

    if (!user) throw 'User not found';

    const { accessToken, refreshToken } = refreshTokens(
      current,
      user.tokenVersion
    );

    setTokens(res, accessToken, refreshToken);
  } catch (error) {
    clearTokens(res);
  }

  res.end();
});

exports.logout = (req, res) => {
  clearTokens(res);
  res.end();
};
