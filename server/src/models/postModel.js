const mongoose = require('mongoose');
const postSchema = mongoose.Schema(
  {
    content: String,
    media: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    Comment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    hashtags: [
      {
        type: String,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
exports.Post = mongoose.model('Post', postSchema);
