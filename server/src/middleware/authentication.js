const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsyncError = require('./catchAsyncError');
const { promisify } = require('util');
const User = require('../models/userModel');

exports.isAuth = catchAsyncError(async (req, res, next) => {
  let token;

  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'jwt_token') {
        token = value;
        break;
      }
    }
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! please log  in to access', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );
  const loggedInUser = await User.findById(decoded.id);
  if (!loggedInUser) {
    return next(
      new AppError('The user belong to this token does no longer exists', 401)
    );
  }
  req.user = loggedInUser;
  next();
});
