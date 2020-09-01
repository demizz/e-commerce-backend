const User = require('../models/userModel');
const HttpError = require('../util/httpError');
const catchAsync = require('../util/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: process.env.EXPIRESIN,
  });
};
const cookieOptions = {
  expires:
    new Date(Date.now() + process.env.COOKIE_EXPIRES) * 24 * 60 * 60 * 1000,
  httpOnly: true,
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, about, role, history } = req.body;
  const isExistingUser = await User.findOne({ email });
  if (isExistingUser) {
    return next(new HttpError('this Email already exist try to login', 422));
  }
  const newUser = await User.create({
    name,
    email,
    password,
    about,
    history,
    role,
  });
  if (!newUser) {
    return next(new HttpError('fail to create new User', 400));
  }
  token = createToken(newUser._id);
  res.cookie('jwt', token, cookieOptions);
  res.status(201).json({
    status: 'success',
    message: 'new user created successfully',
    newUser,
    token,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new HttpError('please provide the email and the password'),
      400
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new HttpError('this email is not registred ', 404));
  }
  const samePassword = await bcrypt.compare(password, user.password);
  if (!user || !samePassword) {
    return next(
      new HttpError('the password or the email are not correct', 401)
    );
  }
  token = createToken(user._id);
  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'succes',
    message: 'user login successfully',
    user,
    token,
  });
});

exports.logout = (req, res, next) => {
  res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
    message: 'user logout successfully',
  });
};

exports.requireSignin = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new HttpError('your are not login please try to login', 401));
  }
  const userId = await promisify(jwt.verify)(token, process.env.SECRET);
  const user = await User.findById(userId.id);
  if (!user) {
    return next(
      new HttpError(
        'this token not longer valid please try to login please !!!',
        401
      )
    );
  }
  req.user = user;
  next();
});
exports.restrictTo = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin' || !req.user.role) {
    return next(new HttpError('Admin resource access denied', 403));
  }
  next();
});
