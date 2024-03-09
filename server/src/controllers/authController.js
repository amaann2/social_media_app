const catchAsyncError = require('../middleware/catchAsyncError');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const { sendToken } = require('../utils/jwtToken');
const crypto = require('crypto');



// REGISTER A USER
exports.register = catchAsyncError(async (req, res, next) => {
  const { username } = req.body;

  const user_name = await User.findOne({ username });
  if (user_name) {
    return next(new AppError('This username is already taken', 400));
  }

  const user = await User.create(req.body);
  sendToken(user, 201, res);
});

// LOG IN A USER
exports.login = catchAsyncError(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return next(
      new AppError('please provide email and password for login', 400)
    );
  }
  const user = await User.findOne({ username }).select('+password');
  if (!user) {
    return next(new AppError('There is no user with that username', 404));
  }
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect username and password', 400));
  }

  sendToken(user, 200, res);
});

// LOGOUT A USER
exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie('jwt_token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'Success',
    message: 'Logout Successfully',
  });
});

// GET MY DETAILS
exports.getMe = catchAsyncError(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

// FORGOT PASSWORD
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const { input } = req.body;
  const user = await User.findOne({
    $or: [{ email: input }, { username: input }],
  });
  if (!user) {
    return next(new AppError(`There is no user with ${input}`, 400));
  }
  const token = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTED_URL}/resetPassword/${token}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Your  Password (valid for 10 min)',
      html: `<h3>Hello ${user.name}</h3>${resetUrl}<p>We received a request to reset your password on Instagram.</p><p>To create a new password and regain access to your account, please follow the link below This link will expire in 10 Minutes, so be sure to use it soon.</p><h4> click here to reset the password : <a href=${resetUrl}>Reset Password </a> </h4><p> If you didn't request a password reset, you can safely ignore this message, and your password will remain unchanged</p><br/> <h5>Thank you for using Instagram!</h5>`,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token send to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email . Try again later!',
        500
      )
    );
  }
});

// RESET PASSWORD

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  sendToken(user, 200, res);
});

// CHANGE MY PASSWORD

exports.changeMyPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  user.password = req.body.password;
  await user.save();
  sendToken(user, 200, res);
});
