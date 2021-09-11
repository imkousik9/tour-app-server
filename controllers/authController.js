const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

const createSendToken = (user, statusCode, req, res) => {
  user.password = undefined;
  req.session.user = user;

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
    res.status(401).json({
      status: 'Bad Request',
      message: 'Incorrect email or password'
    });
  }

  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie(process.env.COOKIE_NAME);
    res.status(200).json({ status: 'success' });
    if (err) {
      console.log(err);
      return;
    }
  });
};
