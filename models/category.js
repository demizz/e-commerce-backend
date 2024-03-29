const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a category must have a name'],
      trim: true,
      maxlength: 32,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
