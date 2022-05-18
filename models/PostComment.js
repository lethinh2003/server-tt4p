const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const postCommentSchema = new mongoose.Schema({
  post: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: [true, "Missing post"],
    },
  ],
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing user"],
    },
  ],
  content: {
    type: String,
    trim: true,
    minlength: [5, "Content must lengths greater or equal 5"],
    required: [true, "Missing content"],
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

const PostComment = mongoose.models.PostComment || mongoose.model("PostComment", postCommentSchema);
module.exports = PostComment;
