const mongoose = require("mongoose");
// const Comment = require("./Comment");
// const User = require("./User");
const repCommentSchema = new mongoose.Schema(
  {
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Missing user"],
      },
    ],
    comment: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
        required: [true, "Missing Comment"],
      },
    ],
    content: {
      type: String,
      trim: true,
      minlength: [5, "content must lengths greater or equal 5"],
      required: [true, "Missing content"],
    },

    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
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
repCommentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "-__v -password",
  });
  next();
});
const RepComment = mongoose.model("RepComment", repCommentSchema);
module.exports = RepComment;
