const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const postSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing user"],
    },
  ],
  comments: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "PostComment",
    },
  ],
  hearts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "PostHeart",
    },
  ],
  hearts_count: {
    type: Number,
    default: 0,
  },
  comments_count: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    trim: true,
    minlength: [5, "Title must lengths greater or equal 5"],
    required: [true, "Missing title"],
  },
  content: {
    type: String,
    trim: true,
    minlength: [5, "Content must lengths greater or equal 5"],
    required: [true, "Missing content"],
  },
  color: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});
postSchema.pre("save", async function (next) {
  if (!this.color) {
    this.color = "#120c1c";
  }
  next();
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
module.exports = Post;
