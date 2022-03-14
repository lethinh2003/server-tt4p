const mongoose = require("mongoose");
const RepComment = require("./RepComment");
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
        ref: RepComment,
      },
    ],

    code: {
      type: String,
      trim: true,
      minlength: [6, "Code must lengths greater or equal 6"],
      required: [true, "Missing code"],
    },
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

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
module.exports = Comment;
