const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const postHeartSchema = new mongoose.Schema(
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
  },
  {
    collection: "post_heart",
    timestamps: true,
  }
);

const PostHeart = mongoose.models.PostHeart || mongoose.model("PostHeart", postHeartSchema);
module.exports = PostHeart;
