const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: 32,
      required: [true, ' A product must have a name '],
      trim: true,
    },
    description: {
      type: String,
      required: [true, ' a product must have a description'],
      trim: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'a product must belong to a category'],
    },
    quantity: {
      type: Number,
    },
    sold: {
      type: Number,
      default: 0,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    shipping: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
