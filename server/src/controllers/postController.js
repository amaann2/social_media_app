const catchAsyncError = require('../middleware/catchAsyncError');
const { Post } = require('../models/postModel');
const cloudinary = require('../utils/cloudinary');
const AppError = require('../utils/appError');
const { Comment } = require('../models/commentModel');
const extractHashtags = require('../utils/extractHashtags');

exports.createPost = catchAsyncError(async (req, res, next) => {
  const uploadImages = [];
  const files = req.files;

  for (const file of files) {
    const mycloud = await cloudinary.uploader.upload(file.path, {
      folder: 'Social_Media',
    });

    const image = {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    };

    uploadImages.push(image);
  }

  const { content } = req.body;

  const newpost = new Post({
    content,
    media: uploadImages,
    user: req.user._id,
  });
  await newpost.save();

  res.status(200).json({
    status: 'Success',
    post: newpost,
  });
});

exports.getAllPost = catchAsyncError(async (req, res, next) => {
  const post = await Post.find({
    user: [...req.user.following, req.user._id],
  })
    .populate('user')
    .select('-image.public_id');

  res.status(200).json({
    status: 'Success',
    result: post.length,
    post,
  });
});

exports.likePost = catchAsyncError(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;
  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError('Post does not exist', 404));
  }

  const isLiked = post.likes.includes(userId);
  if (isLiked) {
    return next(new AppError('You already like this post', 400));
  } else {
    post.likes.push(userId);
  }

  await post.save();

  res.status(200).json({
    status: 'Success',
    message: 'Post Liked Successfully',
  });
});
exports.unlikePost = catchAsyncError(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError('Post does not exist', 404));
  }

  const isLiked = post.likes.includes(userId);
  if (isLiked) {
    post.likes.pull(userId);
  } else {
    return next(new AppError('Please like the post first', 400));
  }
  await post.save();

  res.status(204).json({
    status: 'Success',
    message: 'Post unliked Successfully',
  });
});

// UPDATE POST
exports.updatePost = catchAsyncError(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;
  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError('Post does not exist', 404));
  }

  if (post.user.toString() !== userId.toString()) {
    return next(
      new AppError('You do not have permission to update this post', 403)
    );
  }

  // Destroy existing media if there are new files
  if (req.files && req.files.length > 0) {
    console.log('calling');

    if (post.media && post.media.length > 0) {
      for (const existingMedia of post.media) {
        if (existingMedia.public_id) {
          await cloudinary.uploader.destroy(existingMedia.public_id);
        }
      }
    }

    // Upload new media
    const uploadImages = [];
    const files = req.files;

    for (const file of files) {
      const mycloud = await cloudinary.uploader.upload(file.path, {
        folder: 'Social_Media',
      });

      const image = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };

      uploadImages.push(image);
    }

    post.media = uploadImages;
  }

  // Update content
  post.content = req.body.content;

  await post.save();

  res.status(200).json({
    status: 'Success',
    message: 'Post updated successfully',
    post,
  });
});

// DELETE POST
exports.deletePost = catchAsyncError(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError('Post does not exist', 404));
  }
  if (post.user.toString() !== userId.toString()) {
    return next(
      new AppError('You do not have permission to delete this post', 403)
    );
  }
  // delete all the  comment of that post
  await Comment.deleteMany({ post: postId });

  // destroy the image in cloudinary

  for (let i = 0; i < post.media.length; i++) {
    console.log(post.media[i].public_id);
    await cloudinary.uploader.destroy(post.media[i].public_id);
  }

  await post.deleteOne();

  res.status(204).json({
    status: 'success',
    message: 'Post deleted successfully',
  });
});
