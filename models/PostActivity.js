const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const postActivitySchema = new mongoose.Schema(
  {
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
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const PostActivity = mongoose.models.PostActivity || mongoose.model("PostActivity", postActivitySchema);
module.exports = PostActivity;
