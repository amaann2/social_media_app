const catchAsyncError = require('../middleware/catchAsyncError');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const cloudinary = require('../utils/cloudinary');

// UPDATE MY PROFILE

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const allowedFields = ['name', 'gender', 'mobile', 'bio'];
  if (req.body.password) {
    return next(
      new AppError(
        'This route is not for password update please use /updateMyPasssword.',
        400
      )
    );
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('user does not exist', 400));
  }

  if (req.file) {
    mycloud = await cloudinary.uploader.upload(req.file.path, {
      folder: 'Social_media',
    });

    // destroy the previous avatar from cloudinary if exists
    if (user.avatar && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // update user avatar
    user.avatar = {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    };
  }

  // Update other fields based on allowed fields
  allowedFields.forEach((field) => {
    if (req.body[field]) {
      user[field] = req.body[field];
    }
  });

  await user.save();
  res.status(200).json({
    status: 'Success',
    user,
  });
});

exports.searchUser = catchAsyncError(async (req, res, next) => {
  const user = await User.find({
    username: { $regex: req.query.username },
  })
    .limit(10)
    .select('fullname username avatar');

  res.status(200).json({
    status: 'Success',
    user,
  });
});

exports.follow = catchAsyncError(async (req, res, next) => {
  const userToFollowId = req.params.id;
  const yourId = req.user.id;

  if (userToFollowId === yourId) {
    return next(new AppError('you cannot follow yourself', 400));
  }

  const targetUser = await User.findById(userToFollowId);
  if (!targetUser) {
    return next(new AppError('user not found', 400));
  }

  if (targetUser.followers.includes(yourId)) {
    return next(new AppError('you already follow this user', 400));
  }
  targetUser.followers.push(yourId);

  const currentUser = await User.findById(yourId);
  currentUser.following.push(userToFollowId);

  await targetUser.save();
  await currentUser.save();

  await res.status(200).json({
    status: 'success',
    message: 'Followed',
  });
});

exports.unfollow = catchAsyncError(async (req, res, next) => {
  const yourId = req.user.id;
  const unfollowUserId = req.params.id;

  if (unfollowUserId === yourId) {
    return next(new AppError('you cannot follow/unfollow yourself', 400));
  }

  const targetUser = await User.findById(unfollowUserId);
  if (!targetUser) {
    return next(new AppError('user not found', 400));
  }
  if (targetUser.followers.includes(yourId)) {
    targetUser.followers.pull(yourId);

    const currentUser = await User.findById(yourId);
    currentUser.following.pull(unfollowUserId);

    await currentUser.save();
    await targetUser.save();
    res.status(200).json({
      status: 'Success',
      message: 'Unfollowed',
    });
  } else {
    return next(
      new AppError('Not following the user, no unfollow action performed', 404)
    );
  }
});
