const User = require('../models/userModel');
const { Order } = require('../models/orderModel');
const bcrypt = require('bcryptjs');

const catchAsync = require('../util/catchAsync');
const HttpError = require('../util/httpError');

exports.getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (req.user._id.toString() !== userId.toString()) {
    return next(
      new HttpError(
        'this not your profile only admin can access to this profile'
      )
    );
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new HttpError('this user is not found', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'user found successfully',
    user,
  });
});

exports.getSecretUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);
  if (!user) {
    return next(new HttpError('this user is not found', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'user found successfully',
    user,
  });
});

exports.updateUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  if (req.user._id.toString() !== userId.toString()) {
    return next(new HttpError('this is not your profile', 404));
  }
  const profile = await User.findById(userId);
  if (!profile) {
    return next(new HttpError('fail to find your profile', 404));
  }

  const comparePassword = await bcrypt.compare(
    req.body.currentPassword,
    profile.password
  );
  if (!comparePassword) {
    return next(
      new HttpError('wrong password please provide the correct password', 422)
    );
  }
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, 12);
  const newData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.newPassword,
  };

  const updatedUser = await User.findByIdAndUpdate(userId, newData, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) {
    return next(new HttpError('fail to update this user'));
  }
  res.status(200).json({
    status: 'success',
    message: 'user Updated successfully',
    updatedUser,
  });
});
exports.addOrderToUserHistory = catchAsync(async (req, res, next) => {
  let history = [];
  req.body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.quantity,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });
  const UserUpdate = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { history: history } },
    {
      new: true,
    }
  );
  if (!UserUpdate) {
    return next(new HttpError('fail to update', 400));
  }
  // res.status(200).json({
  //   status: 'success',
  //   updatedUser,
  // });
  next();
});

exports.getListOfOrders = catchAsync(async (req, res, next) => {
  const listOfOrders = await Order.find({ user: req.user._id })
    .populate('user', '_id name')
    .sort('-createdAt');
  if (!listOfOrders) {
    return next(new HttpError('fail ot find the orders for this user', 400));
  }
  res.status(200).json({
    status: 'success',
    length: listOfOrders.length,
    listOfOrders,
  });
});
