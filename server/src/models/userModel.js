const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the name'],
      trim: true,
      maxlength: 25,
      validate: {
        validator: function (name) {
          return /^[a-zA-Z\s]+$/.test(name);
        },
        message: 'name must only contain characters',
      },
    },
    username: {
      type: String,
      required: [true, 'Please provide the username'],
      lowercase: true,
      maxlength: 12,
    },
    email: {
      type: String,
      required: [true, 'Please provide the email'],
      validate: [validator.isEmail, 'please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide the password'],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        default:
          'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png',
      },
    },
    role: {
      type: String,
      default: 'User',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    mobile: {
      type: String,
      default: '',
      minlength: [10, 'Mobile number should be at least 10 digits'],
      maxlength: [10, 'Mobile number should not exceed 10 digits'],
    },
    bio: {
      type: String,
      default: '',
      maxlength: 200,
    },
    saved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    archievePost: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
