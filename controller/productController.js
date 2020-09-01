const Product = require('../models/product');
const catchAsync = require('../util/catchAsync');
const HttpError = require('../util/httpError');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
exports.createProduct = catchAsync(async (req, res, next) => {
  //   const userId = req.params.userId;
  //   const {
  //     name,
  //     description,
  //     price,
  //     category,
  //     quantity,
  //     photo,
  //     shipping,
  //   } = req.body;
  //   console.log(req.body);
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(new HttpError('Image could not uploaded', 400));
    }
    // console.log(fields);
    // console.log(files.photo.path);
    // console.log({
    //   ...fields,
    //   photo: {
    //     data: fs.readFileSync(files.photo.path),
    //     contentType: files.photo.type,
    //   },
    // });
    if (files.photo.size > 1000000) {
      return next(new HttpError('image size must be less than 1MB', 400));
    }
    if (
      !fields.name ||
      !fields.description ||
      !fields.price ||
      !fields.category ||
      !fields.quantity ||
      !fields.shipping
    ) {
      return next(new HttpError('all fields required', 400));
    }
    const newProduct = await Product.create({
      ...fields,
      photo: {
        data: fs.readFileSync(files.photo.path),
        contentType: files.photo.type,
      },
    });
    if (!newProduct) {
      return next(new HttpError('fail to create new product', 400));
    }
    res.status(201).json({
      status: 'success',
      message: 'product create successfuly',
      newProduct,
    });
  });
});
exports.getProductById = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new HttpError('fail to found this product', 404));
  }
  req.product = product;
  next();
});
exports.read = catchAsync(async (req, res, next) => {
  req.product.photo = undefined;
  res.status(200).json({
    status: 'success',
    message: 'product found successfully',
    product: req.product,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.params.userId;

  if (req.user._id.toString() !== userId.toString()) {
    return next(new HttpError('you can not delete this product', 400));
  }
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    return next(new HttpError('fail to create this product', 400));
  }
  res.status(200).json({
    status: 'succes',
    message: 'product deleted successfully',
    deletedProduct: product,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.params.userId;

  if (req.user._id.toString() !== userId.toString()) {
    return next(new HttpError('you can not delete this product', 400));
  }
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(new HttpError('Image could not uploaded', 400));
    }

    if (files.photo.size > 1000000) {
      return next(new HttpError('image size must be less than 1MB', 400));
    }
    if (
      !fields.name ||
      !fields.description ||
      !fields.price ||
      !fields.category ||
      !fields.quantity ||
      !fields.shipping
    ) {
      return next(new HttpError('all fields required', 400));
    }
    const newProduct = await Product.findByIdAndUpdate(
      productId,
      {
        ...fields,
        photo: {
          data: fs.readFileSync(files.photo.path),
          contentType: files.photo.type,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!newProduct) {
      return next(new HttpError('fail to update this product', 400));
    }
    res.status(201).json({
      status: 'success',
      message: 'product update successfuly',
      newProduct,
    });
  });
});

exports.list = catchAsync(async (req, res, next) => {
  let order = req.query.order ? req.query.order : 'asc';
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  const listProduct = await Product.find()
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .limit(limit);
  if (!listProduct) {
    return next(new HttpError('query to this list', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'query success',
    listProduct,
  });
});

exports.relatedList = catchAsync(async (req, res, next) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new HttpError('this product is not found', 404));
  }
  const relatedProduct = await Product.find({
    _id: { $ne: productId },
    category: product.category,
  })
    .select('-photo')
    .limit(limit)
    .populate('category', '_id name');
  if (!relatedProduct) {
    return next(new HttpError('related product not found', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'related product found successfully',
    relatedProduct,
  });
});

exports.listCategory = catchAsync(async (req, res, next) => {
  const allCategory = await Product.distinct('category', {});
  if (!allCategory) {
    return next(new HttpError('no category found', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'all category ',
    allCategory,
  });
});

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = catchAsync(async (req, res, next) => {
  let order = req.body.order ? req.body.order : 'desc';
  let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === 'price') {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  const result = await Product.find(findArgs)
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit);
  if (!result) {
    return next(new HttpError('no result', 404));
  }
  res.status(200).json({
    status: 'success',
    result,
  });
});

exports.productPhoto = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const findProduct = await Product.findById(productId);
  if (!findProduct) {
    return next(new HttpError('this product is not found', 404));
  }
  if (findProduct.photo.data) {
    res.set('Content-Type', findProduct.photo.contentType);
    res.status(200).json({
      status: 'success',
      photo: findProduct.photo.data,
    });
  }
  next();
});
