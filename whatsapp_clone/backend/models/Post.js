const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [2000, 'Post cannot exceed 2000 characters']
    },
    image: {
      type: String,
      default: ''
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Post', postSchema);
