const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name field is required'],
  },
  email: {
    type: String,
    required: [true, 'email field is required'],
    unique: true,
    lowercase: true, // converts string to lowecase
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'password must more 8 characters or more'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm password'],
    validate: {
      // this only works on save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
});

userSchema.pre('save', async function (next) {
  // run if password is modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // delete password confirm
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
