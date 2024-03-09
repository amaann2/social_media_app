const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  tag: Object,
  reply: mongoose.Schema.Types.ObjectId,
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'user',
    },
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  postUserId: mongoose.Types.ObjectId,
});

exports.Comment = mongoose.model('Comment', commentSchema);
