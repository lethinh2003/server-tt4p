const mongoose = require("mongoose");
const RepComment = require("./RepComment");
const Code = require("./Code");
const Blog = require("./Blog");
const commentSchema = new mongoose.Schema(
  {
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Missing user"],
      },
    ],
    reply: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "RepComment",
      },
    ],

    code: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Code",
      },
    ],
    blog: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Blog",
      },
    ],
    content: {
      type: String,
      trim: true,
      minlength: [5, "Content must lengths greater or equal 5"],
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
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "code",
    select: "-__v -link",
  });
  this.populate({
    path: "blog",
    select: "-__v",
  });
  next();
});
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
