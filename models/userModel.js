const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'A user must have a name'],
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'A user must have an email'],
      unique: true,
      validate: [validator.isEmail, 'please provide a valide email address'],
    },
    password: {
      type: String,
      required: [true, 'a user must have a password'],
      minlength: 6,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: String,
    role: {
      type: String,
      default: 'user',
    },
    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const User = mongoose.model('User', userSchema);
module.exports = User;
