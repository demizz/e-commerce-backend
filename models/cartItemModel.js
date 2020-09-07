const mongoose = require('mongoose');
const CartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    count: Number,
  },
  { timestamps: true }
);

const CartItem = mongoose.model('CartItem', CartItemSchema);
module.exports = CartItem;
