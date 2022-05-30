const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const postRepCommentSchema = new mongoose.Schema({
  comment: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "PostComment",
      required: [true, "Missing post comment"],
    },
  ],
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing user"],
    },
  ],
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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

const PostRepComment = mongoose.models.PostRepComment || mongoose.model("PostRepComment", postRepCommentSchema);
module.exports = PostRepComment;
