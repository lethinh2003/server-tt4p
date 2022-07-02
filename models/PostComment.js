const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const postCommentSchema = new mongoose.Schema(
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
    parent_comment: {
      type: mongoose.Schema.ObjectId,
      ref: "PostComment",
    },

    rep_comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "PostComment",
      },
    ],

    content: {
      type: String,
      trim: true,
      minlength: [5, "Content must lengths greater or equal 5"],
      required: [true, "Missing content"],
    },
  },
  {
    timestamps: true,
  }
);
postCommentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "post",
    select: "-__v",
  });
  this.populate({
    path: "rep_comments",
    select: "-__v",
  });
  this.populate({
    path: "user",
    select:
      "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
    populate: {
      path: "avatarSVG",
      model: "AvatarUser",
      select: "-user",
    },
  });

  next();
});

const PostComment = mongoose.models.PostComment || mongoose.model("PostComment", postCommentSchema);
module.exports = PostComment;
