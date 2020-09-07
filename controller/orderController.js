const { Order, CartItem } = require('../models/orderModel');
const catchAsync = require('../util/catchAsync');
const HttpError = require('../util/httpError');
exports.createOrder = catchAsync(async (req, res, next) => {
  req.body.order.user = req.user;

  const newOrder = await Order.create(req.body.order);
  if (!newOrder) {
    return next(new HttpError('fail to create new order', 400));
  }
  res.status(201).json({
    status: 'success',
    newOrder,
  });
});
exports.listOfAllOrders = catchAsync(async (req, res, next) => {
  const list = await Order.find()
    .populate('user', '_id name address')
    .sort('-createdAt');
  if (!list) {
    return next(new HttpError('fail to get all orders', 400));
  }
  res.status(200).json({
    status: 'success',
    list,
  });
});

exports.getStatusValues = catchAsync(async (req, res, next) => {
  const result = Order.schema.path('status').enumValues;
  if (!result) {
    return next(new HttpError('result not found', 400));
  }
  res.status(200).json({
    status: 'success',
    result,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderId, userId } = req.params;
  const orderToUpdate = await Order.findByIdAndUpdate(
    { _id: orderId },
    { $set: { status: req.body.status } },
    { new: true, runValidators: true }
  );

  if (!orderToUpdate) {
    return next(new HttpError('fail to update this order', 400));
  }
  res.status(200).json({
    status: 'success',
    newOrderStatus: orderToUpdate,
  });
});
