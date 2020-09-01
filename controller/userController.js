const User = require('../models/userModel');
const catchAsync = require('../util/catchAsync');
const HttpError = require('../util/httpError');

exports.getUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
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
  if (req.user._id.toString() !== userId) {
    return next(new HttpError('this is not your profile', 404));
  }
  const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
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
