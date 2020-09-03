const Category = require('../models/category');
const catchAsync = require('../util/catchAsync');
const HttpError = require('../util/httpError');

exports.createCategory = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const { name } = req.body;
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(new HttpError('This category is already exist', 401));
  }
  const newCategory = await Category.create({ name });
  if (!newCategory) {
    return next(new HttpError('fail to create new category', 400));
  }
  res.status(201).json({
    status: 'success',
    message: 'category create successfuly',
    newCategory,
  });
});

exports.getCategoryById = catchAsync(async (req, res, next) => {
  const categoryId = req.params.categoryId;

  const category = await Category.findById(categoryId);
  if (!Category) {
    return next(new HttpError('fail to find this  category', 400));
  }
  res.status(201).json({
    status: 'success',
    message: 'category found successfuly',
    category,
  });
});

exports.getAllCategory = catchAsync(async (req, res, next) => {
  const category = await Category.find();
  if (!Category) {
    return next(new HttpError('fail to find All  category', 400));
  }
  res.status(201).json({
    status: 'success',
    message: 'categories found successfuly',
    category,
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const categoryId = req.params.categoryId;
  if (req.user._id.toString() !== userId) {
    return next(new HttpError('you can not update this category', 400));
  }
  const { name } = req.body;
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    { name },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedCategory) {
    return next(new HttpError('fail to update category', 400));
  }
  res.status(201).json({
    status: 'success',
    message: 'category updated successfuly',
    updatedCategory,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const categoryId = req.params.categoryId;
  if (req.user._id.toString() !== userId) {
    return next(new HttpError('you can not update this category', 400));
  }

  const deletedCategory = await Category.findByIdAndDelete(categoryId);
  if (!deletedCategory) {
    return next(new HttpError('fail to delete category', 400));
  }
  res.status(201).json({
    status: 'success',
    message: 'category deleted successfuly',
    deletedCategory,
  });
});
